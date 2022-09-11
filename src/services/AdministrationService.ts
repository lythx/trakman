import { Logger } from "../Logger.js";
import { Client } from "../client/Client.js";
import config from "../../config/Config.js"
import { PrivilegeRepository } from "../database/PrivilegeRepository.js";
import { BanlistRepository } from '../database/BanlistRepository.js'
import { BlacklistRepository } from '../database/BlacklistRepository.js'
import { MutelistRepository } from '../database/MutelistRepository.js'
import { GuestlistRepository } from '../database/GuestlistRepository.js'
import { PlayerService } from "./PlayerService.js";
import { Events } from "../Events.js";

export class AdministrationService {

  private static readonly privilegeRepo = new PrivilegeRepository()
  private static readonly banlistRepo = new BanlistRepository()
  private static readonly blacklistRepo = new BlacklistRepository()
  private static readonly mutelistRepo = new MutelistRepository()
  private static readonly guestlistRepo = new GuestlistRepository()
  private static serverBanlist: TMBanlistEntry[] = []
  private static banOnJoin: TMBanlistEntry[] = []
  private static _blacklist: TMBlacklistEntry[] = []
  private static _mutelist: TMMutelistEntry[] = []
  private static _guestlist: TMGuestlistEntry[] = []
  private static readonly blacklistFile: string = config.blacklistFile
  private static readonly guestlistFile: string = config.guestlistFile

  static async initialize(): Promise<void> {
    await this.privilegeRepo.initialize()
    void this.setOwner()
    await this.banlistRepo.initialize()
    await this.blacklistRepo.initialize()
    await this.mutelistRepo.initialize()
    await this.guestlistRepo.initialize()
    this.banOnJoin = await this.banlistRepo.get()
    this._blacklist = await this.blacklistRepo.get()
    this._mutelist = await this.mutelistRepo.get()
    this._guestlist = await this.guestlistRepo.get()
    await this.fixBanlistCoherence()
    await this.fixBlacklistCoherence()
    await this.fixMutelistCoherence()
    await this.fixGuestlistCoherence()
    this.pollExpireDates()
  }

  static async handleBanOnJoin(ban: TMBanlistEntry) {
    const res = await Client.call('BanAndBlackList',
      [{ string: ban.login }, { string: ban?.reason ?? 'No reason specified' }, { boolean: true }])
    if (res instanceof Error) {
      Logger.error(`Error while server banning player ${ban.login} on join`)
    } else {
      this.banOnJoin = this.banOnJoin.filter(a => a.login !== ban.login)
      this.serverBanlist.push(ban)
    }
    Client.callNoRes('Kick', [{ string: ban.login }, { string: ban?.reason ?? 'No reason specified' }]) // TODO make no reason thingy a var
  }

  /**
   * Sets the server owner to login specified in .env file and removes previous owner if it changed
   */
  private static async setOwner(): Promise<void> {
    const oldOwnerLogin: string | undefined = await this.privilegeRepo.getOwner()
    const newOwnerLogin: string | undefined = process.env.SERVER_OWNER_LOGIN
    if (newOwnerLogin === undefined) {
      await Logger.fatal('SERVER_OWNER_LOGIN is undefined. Check your .env file')
      return
    }
    if (oldOwnerLogin !== newOwnerLogin) {
      if (oldOwnerLogin !== undefined) { await this.privilegeRepo.removeOwner() }
      await this.setPrivilege(newOwnerLogin, 4)
    }
  }

  /**
   * Bans and blacklists all the players present in banlist table if they aren't banned,
   * unbans all players who are on the server banlist but not in banlist table,
   * kicks all banned players from the server
   * (this method doesn't save the blacklist)
   */
  private static async fixBanlistCoherence(): Promise<void> {
    const banlist: any[] | Error = await Client.call('GetBanList', [{ int: 5000 }, { int: 0 }])
    if (banlist instanceof Error) {
      await Logger.fatal('Failed to fetch banlist', 'Server responded with error:', banlist.message)
      return
    }
    for (const e of this.banOnJoin) {
      if (!banlist.some((a: any): boolean => a.Login === e.login)) {
        const params: CallParams[] = e.reason === undefined ? [{ string: e.login }, { string: 'No reason specified' }, { boolean: false }] :
          [{ string: e.login }, { string: e.reason }, { boolean: false }]
        const res = await Client.call('BanAndBlackList', params)
        if (!(res instanceof Error)) {
          this.banOnJoin = this.banOnJoin.filter(a => a.login !== e.login)
          this.serverBanlist.push(e)
        }
      }
    }
    for (const login of banlist.map((a): string => a.Login)) {
      if (!this.banlist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('UnBan', [{ string: login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to remove login ${login} from banlist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const e of PlayerService.players) {
      if (this.banlist.some(a => a.login === e.login)) {
        Client.callNoRes('Kick', [{ string: e.login }])
      }
    }
  }

  /**
   * Blacklists all the players present in blacklist table if they aren't blacklisted,
   * saves the blacklist file,
   * unblacklists all players who are on the server blacklist but not in banlist and blacklist tables,
   * kicks all blacklisted players from the server
   * (this method needs to be run after banlist coherence is fixed)
   */
  private static async fixBlacklistCoherence(): Promise<void> {
    const blacklist: any[] | Error = await Client.call('GetBlackList', [{ int: 5000 }, { int: 0 }])
    if (blacklist instanceof Error) {
      await Logger.fatal('Failed to fetch blacklist', 'Server responded with error:', blacklist.message)
      return
    }
    for (const e of this._blacklist) {
      if (!blacklist.some((a: any): boolean => a.Login === e.login)) {
        const params: CallParams[] = e.reason === undefined ? [{ string: e.login }] :
          [{ string: e.login }, { string: e.reason }]
        const res: any[] | Error = await Client.call('BlackList', params)
        if (res instanceof Error) {
          await Logger.fatal(`Failed to add login ${e.login} to blacklist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of blacklist.map((a): string => a.Login)) {
      if (!this._blacklist.some((a: any): boolean => a.login === login) &&
        !this.serverBanlist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('UnBlackList', [{ string: login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to remove login ${login} from blacklist`, `Server responded with error:`, res.message)
        }
      }
    }
    const save = await Client.call('SaveBlackList', [{ string: this.blacklistFile }])
    if (save instanceof Error) {
      await Logger.fatal(`Failed to save blacklist`, `Server responded with error:`, save.message)
    }
    for (const e of PlayerService.players) {
      if (this._blacklist.some(a => a.login === e.login)) {
        Client.callNoRes('Kick', [{ string: e.login }])
      }
    }
  }

  /**
   * Mutes all the players present in mutelist table if they aren't muted,
   * unmutes all players who are on the server mutelist but not in mutelist table
   */
  private static async fixMutelistCoherence(): Promise<void> {
    const mutelist: any[] | Error = await Client.call('GetIgnoreList', [{ int: 5000 }, { int: 0 }])
    if (mutelist instanceof Error) {
      await Logger.fatal('Failed to fetch mutelist', 'Server responded with error:', mutelist.message)
      return
    }
    for (const e of this._mutelist) {
      if (!mutelist.some((a: any): boolean => a.Login === e.login)) {
        const res: any[] | Error = await Client.call('Ignore', [{ string: e.login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to add login ${e.login} to mutelist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of mutelist.map((a): string => a.Login)) {
      if (!this._mutelist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('UnIgnore', [{ string: login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to remove login ${login} from mutelist`, `Server responded with error:`, res.message)
        }
      }
    }
  }

  /**  
   * Adds all the players present in guestlist table to server guestlist if they aren't guests,
   * removes all players who are on the server guestlist but not in guestlist table
   */
  private static async fixGuestlistCoherence(): Promise<void> {
    const guestlist: any[] | Error = await Client.call('GetGuestList', [{ int: 5000 }, { int: 0 }])
    if (guestlist instanceof Error) {
      await Logger.fatal('Failed to fetch guestlist', 'Server responded with error:', guestlist.message)
      return
    }
    for (const e of this._guestlist) {
      if (!guestlist.some((a: any): boolean => a.Login === e.login)) {
        const res: any[] | Error = await Client.call('AddGuest', [{ string: e.login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to add login ${e.login} to guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of guestlist.map((a): string => a.Login)) {
      if (!this._guestlist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('RemoveGuest', [{ string: login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to remove login ${login} from guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
    const save = await Client.call('SaveGuestList', [{ string: this.guestlistFile }])
    if (save instanceof Error) {
      await Logger.fatal(`Failed to save guestlist`, `Server responded with error:`, save.message)
    }
  }

  /**
   * Checks for expired bans, blacklists and mutes every 5 seconds and calls functions to remove them
   */
  private static pollExpireDates(): void {
    setInterval((): void => {
      const date: Date = new Date()
      for (const e of this.banlist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
        this.unban(e.login)
      }
      for (const e of this._blacklist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
        this.unblacklist(e.login)
      }
      for (const e of this._mutelist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
        this.unmute(e.login)
      }
    }, 5000)
  }

  /**
   * Sets a player privilege level
   * @param login Player login
   * @param privilege Privilege level to set
   * @param caller Optional caller player object
   */
  static async setPrivilege(login: string, privilege: number, caller?: { login: string, nickname: string }): Promise<void> {
    const player: TMPlayer | undefined = PlayerService.get(login)
    if (player !== undefined) { player.privilege = privilege }
    if (caller !== undefined) {
      Logger.info(`Player ${caller.login} changed ${login} privilege to ${privilege}`)
    } else {
      Logger.info(`${login} privilege set to ${privilege}`)
    }
    if (player === undefined) {
      const player = await PlayerService.fetch(login)
      Events.emitEvent('Controller.PrivilegeChanged', {
        player: player === undefined ? undefined : { ...player, privilege },
        login,
        previousPrivilege: player?.privilege ?? 0,
        newPrivilege: privilege,
        caller
      })
      void this.privilegeRepo.set(login, privilege)
      return
    }
    Events.emitEvent('Controller.PrivilegeChanged', {
      player: player === undefined ? undefined : { ...player, privilege },
      login,
      previousPrivilege: player.privilege ?? 0,
      newPrivilege: privilege,
      caller
    })
    void this.privilegeRepo.set(login, privilege)
  }

  /**
   * Bans, blacklists and kicks a player. If player is not on the server adds him to banOnJoin array. Adds him to banlist table
   * @param ip Player IP address
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @param reason Optional ban reason
   * @param expireDate Optional ban expire date
   */
  static async ban(ip: string, login: string, caller: { login: string, nickname: string },
    nickname?: string, reason?: string, expireDate?: Date): Promise<void> {
    const date: Date = new Date()
    let entry = this.banOnJoin.find(a => a.login === login)
    if (entry === undefined) {
      entry = this.serverBanlist.find(a => a.login === login && a.ip === ip)
    }
    const reasonString: string = reason === undefined ? 'No reason specified' : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = caller.login
      entry.callerNickname = caller.nickname
      entry.reason = reason
      entry.expireDate = expireDate
      entry.date = date
      void this.banlistRepo.update(ip, login, date, caller.login, reason, expireDate)
      Logger.info(`${caller.nickname} (${caller.login}) has banned ${login} with ip ${ip}`, durationString, reasonString)
      return
    }
    const res = await Client.call('BanAndBlackList',
      [{ string: login }, { string: reason ?? 'No reason specified' }, { boolean: true }])
    if (res instanceof Error) {
      this.banOnJoin.push({
        ip, login, nickname, date, callerNickname: caller.nickname,
        callerLogin: caller.login, reason, expireDate
      })
    } else {
      this.serverBanlist.push({
        ip, login, nickname, date, callerNickname: caller.nickname,
        callerLogin: caller.login, reason, expireDate
      })
    }
    void this.banlistRepo.add(ip, login, date, caller.login, reason, expireDate)
    Logger.info(`${caller.nickname} (${caller.login}) has banned ${login} with ip ${ip}`, durationString, reasonString)
    Client.callNoRes('Kick', [{ string: login }])
  }

  /**
   * Unbans a player and unblacklists him if he is not blacklisted. Deletes all ips tied to his login
   * from banlist table
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successfull, false if player was not banned, Error if dedicated server call fails
   */
  static async unban(login: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    const serverBan = this.serverBanlist.find(a => a.login === login)
    if (serverBan === undefined && !this.banOnJoin.some(a => a.login === login)) { return false }
    if (serverBan !== undefined) {
      const res = await Client.call('UnBan', [{ string: login }])
      if (res instanceof Error) { return res }
      if (!this._blacklist.some(a => a.login === login)) {
        const res = await Client.call('UnBlackList', [{ string: login }])
        if (res instanceof Error) { return res }
      }
      this.serverBanlist = this.serverBanlist.filter(a => a.login !== login)
    } else {
      this.banOnJoin = this.banOnJoin.filter(a => a.login !== login)
    }
    void this.banlistRepo.remove(login)
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has unbanned ${login}`)
    } else {
      Logger.info(`${login} has been unbanned`)
    }
    return true
  }

  /**
   * Blacklists and kicks a player, adds him to blacklist table. Saves the server blacklist
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @param reason Optional blacklist reason
   * @param expireDate Optional blacklist expire date
   * @returns True if successfull, Error if server call fails
   */
  static async addToBlacklist(login: string, caller: { login: string, nickname: string }, nickname?: string, reason?: string, expireDate?: Date): Promise<true | Error> {
    const date: Date = new Date()
    const entry = this._blacklist.find(a => a.login === login)
    const reasonString: string = reason === undefined ? 'No reason specified' : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = caller.login
      entry.callerNickname = caller.nickname
      entry.reason = reason
      entry.expireDate = expireDate
      entry.date = date
      void this.blacklistRepo.update(login, date, caller.login, reason, expireDate)
      Logger.info(`${caller.nickname} (${caller.login}) has blacklisted ${login}`, durationString, reasonString)
      return true
    }
    if (!this.serverBanlist.some(a => a.login === login)) {
      const res = await Client.call('BlackList', [{ string: login }])
      if (res instanceof Error) { return res }
    }
    this._blacklist.push({
      login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    })
    void this.blacklistRepo.add(login, date, caller.login, reason, expireDate)
    Logger.info(`${caller.nickname} (${caller.login}) has blacklisted ${login}`, durationString, reasonString)
    Client.callNoRes('Kick', [{ string: login }])
    Client.callNoRes('SaveBlackList', [{ string: this.blacklistFile }])
    return true
  }

  /**
   * Unblacklists a player if he is not banned and deletes him from blacklist table. Saves the server blacklist
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successfull, false if player was not blacklisted, Error if dedicated server call fails
   */
  static async unblacklist(login: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    if (!this._blacklist.some(a => a.login === login)) { return false }
    if (!this.serverBanlist.some(a => a.login === login)) {
      const res = await Client.call('UnBlackList', [{ string: login }])
      if (res instanceof Error) { return res }
    }
    this._blacklist = this._blacklist.filter(a => a.login !== login)
    void this.blacklistRepo.remove(login)
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has unblacklisted ${login}`)
    } else {
      Logger.info(`${login} has been unblacklisted`)
    }
    Client.callNoRes('SaveBlackList', [{ string: this.blacklistFile }])
    return true
  }

  /**
   * Mutes a player and adds him to mutelist table
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @param reason Optional mute reason
   * @param expireDate Optional mute expire date
   * @returns True if successfull, Error if server call fails
   */
  static async mute(login: string, caller: { login: string, nickname: string }, nickname?: string, reason?: string, expireDate?: Date): Promise<true | Error> {
    const date: Date = new Date()
    const entry = this._mutelist.find(a => a.login === login)
    const reasonString: string = reason === undefined ? 'No reason specified' : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = caller.login
      entry.callerNickname = caller.nickname
      entry.reason = reason
      entry.expireDate = expireDate
      entry.date = date
      void this.mutelistRepo.update(login, date, caller.login, reason, expireDate)
      Logger.info(`${caller.nickname} (${caller.login}) has muted ${login}`, durationString, reasonString)
      return true
    }
    const res = await Client.call('Ignore', [{ string: login }])
    if (res instanceof Error) { return res }
    this._mutelist.push({
      login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    })
    void this.mutelistRepo.add(login, date, caller.login, reason, expireDate)
    Logger.info(`${caller.nickname} (${caller.login}) has muted ${login}`, durationString, reasonString)
    return true
  }

  /**
   * Unmutes a player and deletes him from mutelist table
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successfull, false if player was not muted, Error if dedicated server call fails
   */
  static async unmute(login: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    if (!this._mutelist.some(a => a.login === login)) { return false }
    const res = await Client.call('UnIgnore', [{ string: login }])
    if (res instanceof Error) { return res }
    this._mutelist = this._mutelist.filter(a => a.login !== login)
    void this.mutelistRepo.remove(login)
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has unmuted ${login}`)
    } else {
      Logger.info(`${login} has been unmuted`)
    }
    return true
  }

  /**
   * Adds a player to server guestlist, saves it and adds him to guestlist table
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @returns True if successfull, false is player was already in the guestlist, Error if server call fails
   */
  static async addGuest(login: string, caller: { login: string, nickname: string }, nickname?: string): Promise<boolean | Error> {
    const date: Date = new Date()
    const entry = this._guestlist.find(a => a.login === login)
    if (entry !== undefined) { return false }
    const res = await Client.call('AddGuest', [{ string: login }])
    if (res instanceof Error) { return res }
    this._guestlist.push({
      login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login
    })
    void this.guestlistRepo.add(login, date, caller.login)
    Logger.info(`${caller.nickname} (${caller.login}) has added ${login} to guestlist`)
    Client.callNoRes('SaveGuestList', [{ string: this.guestlistFile }])
    return true
  }

  /**
   * Removes a player from server guestlist, saves it and deletes him from guestlist table
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successfull, false if player was not in the guestlist, Error if dedicated server call fails
   */
  static async removeGuest(login: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    if (!this._guestlist.some(a => a.login === login)) { return false }
    const res = await Client.call('RemoveGuest', [{ string: login }])
    if (res instanceof Error) { return res }
    this._guestlist = this._guestlist.filter(a => a.login !== login)
    void this.guestlistRepo.remove(login)
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has removed ${login} from guestlist`)
    } else {
      Logger.info(`${login} has been removed from guestlist`)
    }
    Client.callNoRes('SaveGuestList', [{ string: this.guestlistFile }])
    return true
  }

  /**
   * Gets ban information for given login
   * @param login Player login
   * @returns Ban object or undefined if the player isn't banned
   */
  static getBan(login: string): Readonly<TMBanlistEntry> | undefined
  /**
   * Gets multiple bans information for given logins
   * @param logins Array of player logins
   * @returns Array of ban objects
   */
  static getBan(logins: string[]): Readonly<TMBanlistEntry>[]
  static getBan(logins: string | string[]): Readonly<TMBanlistEntry> | Readonly<TMBanlistEntry>[] | undefined {
    if (typeof logins === 'string') {
      return this.banlist.find(a => a.login === logins)
    }
    return this.banlist.filter(a => logins.includes(a.login))
  }

  /**
   * Gets blacklist information for given login
   * @param login Player login
   * @returns Blacklist object or undefined if the player isn't blacklisted
   */
  static getBlacklist(login: string): Readonly<TMBlacklistEntry> | undefined
  /**
   * Gets multiple blacklists information for given logins
   * @param logins Array of player logins
   * @returns Array of blacklist objects
   */
  static getBlacklist(logins: string[]): Readonly<TMBlacklistEntry>[]
  static getBlacklist(logins: string | string[]): Readonly<TMBlacklistEntry> | Readonly<TMBlacklistEntry>[] | undefined {
    if (typeof logins === 'string') {
      return this._blacklist.find(a => a.login === logins)
    }
    return this._blacklist.filter(a => logins.includes(a.login))
  }

  /**
   * Gets mute information for given login
   * @param login Player login
   * @returns Mute object or undefined if the player isn't muted
   */
  static getMute(login: string): Readonly<TMMutelistEntry> | undefined
  /**
   * Gets multiple mutes information for given logins
   * @param logins Array of player logins
   * @returns Array of mute objects
   */
  static getMute(logins: string[]): Readonly<TMMutelistEntry>[]
  static getMute(logins: string | string[]): Readonly<TMMutelistEntry> | Readonly<TMMutelistEntry>[] | undefined {
    if (typeof logins === 'string') {
      return this._mutelist.find(a => a.login === logins)
    }
    return this._mutelist.filter(a => logins.includes(a.login))
  }

  /**
   * Gets guest information for given login
   * @param login Player login
   * @returns Guest object or undefined if the player isn't in the guestlist
   */
  static getGuest(login: string): Readonly<TMGuestlistEntry> | undefined
  /**
   * Gets multiple guests information for given logins
   * @param logins Array of player logins
   * @returns Array of guest objects
   */
  static getGuest(logins: string[]): Readonly<TMGuestlistEntry>[]
  static getGuest(logins: string | string[]): Readonly<TMGuestlistEntry> | Readonly<TMGuestlistEntry>[] | undefined {
    if (typeof logins === 'string') {
      return this._guestlist.find(a => a.login === logins)
    }
    return this._guestlist.filter(a => logins.includes(a.login))
  }

  /**
   * @returns Array of all ban objects
   */
  static get banlist(): Readonly<TMBanlistEntry>[] {
    return [...this.serverBanlist, ...this.banOnJoin]
  }

  /**
   * @returns Array of all blacklist objects
   */
  static get blacklist(): Readonly<TMBlacklistEntry>[] {
    return [...this._blacklist]
  }

  /**
   * @returns Array of all mute objects
   */
  static get mutelist(): Readonly<TMMutelistEntry>[] {
    return [...this._mutelist]
  }

  /**
   * @returns Array of all guest objects
   */
  static get guestlist(): Readonly<TMGuestlistEntry>[] {
    return [...this._guestlist]
  }

  /**
   * @returns Number of banned players
   */
  static get banCount(): number {
    return this.serverBanlist.length + this.banOnJoin.length
  }

  /**
   * @returns Number of blacklisted players
   */
  static get blacklistCount(): number {
    return this._blacklist.length
  }

  /**
   * @returns Number of muted players
   */
  static get muteCount(): number {
    return this._mutelist.length
  }

  /**
   * @returns Number of guests
   */
  static get guestCount(): number {
    return this._guestlist.length
  }

}