import { Logger } from "../Logger.js"
import { Client } from "../client/Client.js"
import config from "../../config/Config.js"
import 'dotenv/config'
import { PrivilegeRepository } from "../database/PrivilegeRepository.js"
import { BanlistRepository } from '../database/BanlistRepository.js'
import { BlacklistRepository } from '../database/BlacklistRepository.js'
import { MutelistRepository } from '../database/MutelistRepository.js'
import { GuestlistRepository } from '../database/GuestlistRepository.js'
import { PlayerService } from "./PlayerService.js"
import { Events } from "../Events.js"

export class AdministrationService {

  private static readonly privilegeRepo = new PrivilegeRepository()
  private static readonly banlistRepo = new BanlistRepository()
  private static readonly blacklistRepo = new BlacklistRepository()
  private static readonly mutelistRepo = new MutelistRepository()
  private static readonly guestlistRepo = new GuestlistRepository()
  private static serverBanlist: tm.BanlistEntry[] = []
  private static banOnJoin: tm.BanlistEntry[] = []
  private static _blacklist: tm.BlacklistEntry[] = []
  private static serverMutelist: tm.MutelistEntry[] = []
  private static muteOnJoin: tm.MutelistEntry[] = []
  private static _guestlist: tm.GuestlistEntry[] = []
  private static _oplist: tm.PrivilegeEntry[] = []
  private static _adminlist: tm.PrivilegeEntry[] = []
  private static _masteradminlist: tm.PrivilegeEntry[] = []
  /** Relative path (/GameData/Config/) to the blacklist file. */
  static readonly blacklistFile: string = config.blacklistFile
  /** Relative path (/GameData/Config/) to the guestlist file. */
  static readonly guestlistFile: string = config.guestlistFile
  /** Privilege levels for each of the administrative actions. */
  static readonly privileges: {
    readonly ban: number,
    readonly blacklist: number,
    readonly mute: number,
    readonly addGuest: number,
    readonly kick: number,
    readonly forceSpectator: number
  } = config.privileges

  static async initialize(): Promise<void> {
    void this.setOwner()
    this.banOnJoin = await this.banlistRepo.get()
    this._blacklist = await this.blacklistRepo.get()
    this.muteOnJoin = await this.mutelistRepo.get()
    this._guestlist = await this.guestlistRepo.get()
    this._oplist = await this.privilegeRepo.getOperators()
    this._adminlist = await this.privilegeRepo.getAdmins()
    this._masteradminlist = await this.privilegeRepo.getMasteradmins()
    await this.fixBanlistCoherence()
    await this.fixBlacklistCoherence()
    await this.fixMutelistCoherence()
    await this.fixGuestlistCoherence()
    this.pollExpireDates()
  }

  /**
   * Handle ban and mute on join
   * @param login Player login
   * @param ip Player ip address
   * @returns True if player can join, false otherwise
   */
  static async handleJoin(login: string, ip: string): Promise<boolean> {
    const mute = this.muteOnJoin.find(a => a.login === login)
    if (mute !== undefined) {
      const res = await Client.call('Ignore', [{ string: mute.login }])
      if (res instanceof Error) {
        Logger.error(`Error while server muting player ${mute.login} on join`)
      } else {
        this.muteOnJoin = this.muteOnJoin.filter(a => a.login !== mute.login)
        this.serverMutelist.push(mute)
      }
    }
    const ban = this.banOnJoin.find(a => a.login === login || a.ip === ip)
    if (ban !== undefined) {
      const res = await Client.call('BanAndBlackList',
        [{ string: ban.login }, { string: ban?.reason ?? config.defaultReasonMessage }, { boolean: true }])
      if (res instanceof Error) {
        Logger.error(`Error while server banning player ${ban.login} on join`)
      } else {
        this.banOnJoin = this.banOnJoin.filter(a => a.login !== ban.login)
        this.serverBanlist.push(ban)
      }
      Client.callNoRes('Kick', [{ string: ban.login }, { string: ban?.reason ?? config.defaultReasonMessage }])
      return false
    }
    return true
  }

  /**
   * Updates the player nickname in runtime memory
   * @param players Objects containing player logins and nicknames
   */
  static updateNickname(...players: { login: string, nickname: string }[]): void {
    const replaceNickname = (arr: { nickname?: string, login: string, callerLogin: string, callerNickname: string }[]) => {
      for (const p of players) {
        const obj = arr.find(a => a.login === p.login)
        if (obj !== undefined) { obj.nickname = p.nickname }
        const obj2 = arr.find(a => a.callerLogin === p.login)
        if (obj2 !== undefined) { obj2.callerNickname = p.nickname }
      }
    }
    replaceNickname(this.banOnJoin)
    replaceNickname(this.serverBanlist)
    replaceNickname(this._blacklist)
    replaceNickname(this.muteOnJoin)
    replaceNickname(this.serverMutelist)
    replaceNickname(this._guestlist)
  }

  /**
   * Sets the server owner to login specified in .env file and removes previous owner if it changed
   */
  private static async setOwner(): Promise<void> {
    if (process.env.OWNER_LOGIN === undefined) {
      Logger.warn('OWNER_LOGIN not specified. Change your .env file to use owner privileges')
      return
    }
    const oldOwnerLogin: string | undefined = await this.privilegeRepo.getOwner()
    const newOwnerLogin: string = process.env.OWNER_LOGIN
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
      const params: tm.CallParams[] = e.reason === undefined ? [{ string: e.login }, { string: config.defaultReasonMessage }, { boolean: false }] :
        [{ string: e.login }, { string: e.reason }, { boolean: false }]
      if (!banlist.some((a: any): boolean => a.Login === e.login)) {
        const res = await Client.call('BanAndBlackList', params)
        if (!(res instanceof Error)) {
          this.banOnJoin = this.banOnJoin.filter(a => a.login !== e.login)
          this.serverBanlist.push(e)
        }
      } else {
        Client.callNoRes('Blacklist', params)
        this.banOnJoin = this.banOnJoin.filter(a => a.login !== e.login)
        this.serverBanlist.push(e)
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
        const res: any | Error = await Client.call('BlackList', [{ string: e.login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to add login ${e.login} to blacklist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of blacklist.map((a): string => a.Login)) {
      if (!this._blacklist.some((a: any): boolean => a.login === login) &&
        !this.serverBanlist.some((a: any): boolean => a.login === login)) {
        const res: any | Error = await Client.call('UnBlackList', [{ string: login }])
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
    for (const e of this.muteOnJoin) {
      if (!mutelist.some((a: any): boolean => a.Login === e.login)) {
        const res: any | Error = await Client.call('Ignore', [{ string: e.login }])
        if (!(res instanceof Error)) {
          this.muteOnJoin = this.muteOnJoin.filter(a => a.login !== e.login)
          this.serverMutelist.push(e)
        }
      } else {
        this.muteOnJoin = this.muteOnJoin.filter(a => a.login !== e.login)
        this.serverMutelist.push(e)
      }
    }
    for (const login of mutelist.map((a): string => a.Login)) {
      if (!this.mutelist.some((a: any): boolean => a.login === login)) {
        const res: any | Error = await Client.call('UnIgnore', [{ string: login }])
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
        const res: any | Error = await Client.call('AddGuest', [{ string: e.login }])
        if (res instanceof Error) {
          await Logger.fatal(`Failed to add login ${e.login} to guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of guestlist.map((a): string => a.Login)) {
      if (!this._guestlist.some((a: any): boolean => a.login === login)) {
        const res: any | Error = await Client.call('RemoveGuest', [{ string: login }])
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
      for (const e of this.mutelist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
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
    if (login.length > 25) { return }
    const player: tm.Player | undefined = PlayerService.get(login)
    if (player !== undefined) { player.privilege = privilege }
    if (caller !== undefined) {
      Logger.info(`Player ${caller.login} changed ${login} privilege to ${privilege}`)
    } else {
      Logger.info(`${login} privilege set to ${privilege}`)
    }
    if (player === undefined) {
      const player = await PlayerService.fetch(login)
      await this.privilegeRepo.set(login, privilege)
      await this.updatePrivilegeArrays()
      Events.emit('PrivilegeChanged', {
        player: player === undefined ? undefined : { ...player, privilege },
        login,
        previousPrivilege: player?.privilege ?? 0,
        newPrivilege: privilege,
        caller
      })
      return
    }
    PlayerService.updateInfo({ login, title: PlayerService.getTitle(login, privilege, player.country, player.countryCode) })
    await this.privilegeRepo.set(login, privilege)
    await this.updatePrivilegeArrays()
    Events.emit('PrivilegeChanged', {
      player: player === undefined ? undefined : { ...player, privilege },
      login,
      previousPrivilege: player.privilege ?? 0,
      newPrivilege: privilege,
      caller
    })
  }

  /**
   * Bans, blacklists and kicks a player. If player is not on the server adds him to banOnJoin array. Adds him to banlist table
   * @param ip Player IP address
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @param reason Optional ban reason
   * @param expireDate Optional ban expire date
   * @returns True if successful, false if caller privilege is too low or if it's not higher than target privilege
   */
  static async ban(ip: string, login: string, caller: { login: string, privilege: number, nickname: string },
    nickname?: string, reason?: string, expireDate?: Date): Promise<boolean> {
    if (caller.privilege < this.privileges.ban || login.length > 25) { return false }
    const targetPrivilege = (await PlayerService.fetch(login))?.privilege
    if (targetPrivilege !== undefined && targetPrivilege >= caller.privilege) { return false }
    const date: Date = new Date()
    let entry = this.banOnJoin.find(a => a.login === login)
    if (entry === undefined) {
      entry = this.serverBanlist.find(a => a.login === login && a.ip === ip)
    }
    const reasonString: string = reason === undefined ? config.defaultReasonMessage : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = caller.login
      entry.callerNickname = caller.nickname
      entry.reason = reason
      entry.expireDate = expireDate
      entry.date = date
      await this.banlistRepo.update(ip, login, date, caller.login, reason, expireDate)
      Events.emit('Ban', entry)
      Logger.info(`${caller.nickname} (${caller.login}) has banned ${login} with ip ${ip}`, durationString, reasonString)
      return true
    }
    const res = await Client.call('BanAndBlackList',
      [{ string: login }, { string: reason ?? config.defaultReasonMessage }, { boolean: true }])
    const obj = {
      ip, login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    }
    if (res instanceof Error) {
      this.banOnJoin.push(obj)
    } else {
      this.serverBanlist.push(obj)
    }
    await this.banlistRepo.add(ip, login, date, caller.login, reason, expireDate)
    Events.emit('Ban', obj)
    Logger.info(`${caller.nickname} (${caller.login}) has banned ${login} with ip ${ip}`, durationString, reasonString)
    Client.callNoRes('Kick', [{ string: login }])
    return true
  }

  /**
   * Unbans a player and unblacklists him if he is not blacklisted. Deletes all ips tied to his login
   * from banlist table
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successful, false if caller privilege is too low 
   * 'Player not banned' if player was not banned, Error if dedicated server call fails
   */
  static async unban(login: string, caller?: { login: string, privilege: number, nickname: string }):
    Promise<boolean | 'Player not banned' | Error> {
    if (caller !== undefined && caller.privilege < this.privileges.ban) { return false }
    const serverBanIndex = this.serverBanlist.findIndex(a => a.login === login)
    const banOnJoinIndex = this.banOnJoin.findIndex(a => a.login === login)
    if (serverBanIndex === -1 && banOnJoinIndex === -1) { return 'Player not banned' }
    let obj: tm.BanlistEntry | undefined
    if (serverBanIndex !== -1) {
      const res = await Client.call('UnBan', [{ string: login }])
      if (res instanceof Error) { return res }
      if (!this._blacklist.some(a => a.login === login)) {
        const res = await Client.call('UnBlackList', [{ string: login }])
        if (res instanceof Error) { return res }
      }
      obj = this.serverBanlist[serverBanIndex]
      this.serverBanlist.splice(serverBanIndex, 1)
    } else {
      obj = this.banOnJoin[banOnJoinIndex]
      this.banOnJoin.splice(banOnJoinIndex, 1)
    }
    await this.banlistRepo.remove(login)
    Events.emit('Unban', obj)
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
   * @returns True if successful, false if caller privilege is too low or if it's not higher than target privilege,
   * Error if dedicated server call fails
   */
  static async addToBlacklist(login: string, caller: { login: string, privilege: number, nickname: string },
    nickname?: string, reason?: string, expireDate?: Date): Promise<boolean | Error> {
    if (caller.privilege < this.privileges.blacklist || login.length > 25) { return false }
    const targetPrivilege = (await PlayerService.fetch(login))?.privilege
    if (targetPrivilege !== undefined && targetPrivilege >= caller.privilege) { return false }
    const date: Date = new Date()
    const entry = this._blacklist.find(a => a.login === login)
    const reasonString: string = reason === undefined ? config.defaultReasonMessage : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = caller.login
      entry.callerNickname = caller.nickname
      entry.reason = reason
      entry.expireDate = expireDate
      entry.date = date
      await this.blacklistRepo.update(login, date, caller.login, reason, expireDate)
      Events.emit('Blacklist', entry)
      Logger.info(`${caller.nickname} (${caller.login}) has blacklisted ${login}`, durationString, reasonString)
      return true
    }
    if (!this.serverBanlist.some(a => a.login === login)) {
      const res = await Client.call('BlackList', [{ string: login }])
      if (res instanceof Error) { return res }
    }
    const obj = {
      login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    }
    this._blacklist.push(obj)
    await this.blacklistRepo.add(login, date, caller.login, reason, expireDate)
    Events.emit('Blacklist', obj)
    Logger.info(`${caller.nickname} (${caller.login}) has blacklisted ${login}`, durationString, reasonString)
    Client.callNoRes('Kick', [{ string: login }])
    Client.callNoRes('SaveBlackList', [{ string: this.blacklistFile }])
    return true
  }

  /**
   * Unblacklists a player if he is not banned and deletes him from blacklist table. Saves the server blacklist
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successful, false if caller privilege is too low 
   * 'Player not blacklisted' if player was not blacklisted, Error if dedicated server call fails
   */
  static async unblacklist(login: string, caller?: { login: string, privilege: number, nickname: string }):
    Promise<boolean | 'Player not blacklisted' | Error> {
    if (caller !== undefined && caller.privilege < this.privileges.blacklist) { return false }
    const blIndex = this._blacklist.findIndex(a => a.login === login)
    if (blIndex === -1) { return 'Player not blacklisted' }
    if (!this.serverBanlist.some(a => a.login === login)) {
      const res = await Client.call('UnBlackList', [{ string: login }])
      if (res instanceof Error) { return res }
    }
    const obj = this._blacklist[blIndex]
    this._blacklist.splice(blIndex, 1)
    await this.blacklistRepo.remove(login)
    Events.emit('Unblacklist', obj)
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
   * @returns True if successful, false if caller privilege is too low
   */
  static async mute(login: string, caller: { login: string, privilege: number, nickname: string },
    nickname?: string, reason?: string, expireDate?: Date): Promise<boolean> {
    if (caller.privilege < this.privileges.mute || login.length > 25) { return false }
    const date: Date = new Date()
    let entry = this.muteOnJoin.find(a => a.login === login)
    if (entry === undefined) {
      entry = this.serverMutelist.find(a => a.login === login)
    }
    const reasonString: string = reason === undefined ? config.defaultReasonMessage : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = caller.login
      entry.callerNickname = caller.nickname
      entry.reason = reason
      entry.expireDate = expireDate
      entry.date = date
      await this.mutelistRepo.update(login, date, caller.login, reason, expireDate)
      Events.emit('Mute', entry)
      Logger.info(`${caller.nickname} (${caller.login}) has muted ${login}`, durationString, reasonString)
      return true
    }
    const res = await Client.call('Ignore', [{ string: login }])
    const obj = {
      login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    }
    if (res instanceof Error) {
      this.muteOnJoin.push(obj)
    } else {
      this.serverMutelist.push(obj)
    }
    await this.mutelistRepo.add(login, date, caller.login, reason, expireDate)
    Events.emit('Mute', obj)
    Logger.info(`${caller.nickname} (${caller.login}) has muted ${login}`, durationString, reasonString)
    return true
  }

  /**
   * Unmutes a player and deletes him from mutelist table
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successful, false if caller privilege is too low 
   * 'Player not muted' if player was not muted, Error if dedicated server call fails
   */
  static async unmute(login: string, caller?: { login: string, privilege: number, nickname: string }):
    Promise<boolean | 'Player not muted' | Error> {
    if (caller !== undefined && caller.privilege < this.privileges.mute) { return false }
    const serverMuteIndex = this.serverMutelist.findIndex(a => a.login === login)
    const muteOnJoinIndex = this.muteOnJoin.findIndex(a => a.login === login)
    if (serverMuteIndex === -1 && muteOnJoinIndex === -1) { return 'Player not muted' }
    let obj: tm.MutelistEntry | undefined
    if (serverMuteIndex !== -1) {
      const res = await Client.call('UnIgnore', [{ string: login }])
      if (res instanceof Error) { return res }
      obj = this.serverMutelist[serverMuteIndex]
      this.serverMutelist.splice(serverMuteIndex, 1)
    } else {
      obj = this.muteOnJoin[muteOnJoinIndex]
      this.muteOnJoin.splice(muteOnJoinIndex, 1)
    }
    await this.mutelistRepo.remove(login)
    Events.emit('Unmute', obj)
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
   * @returns True if successful, false if caller privilege is too low,
   * 'Already guest' if player was already in the guestlist, Error if server call fails
   */
  static async addGuest(login: string, caller: { login: string, privilege: number, nickname: string }, nickname?: string):
    Promise<boolean | 'Already guest' | Error> {
    if (caller.privilege < this.privileges.addGuest || login.length > 25) { return false }
    const date: Date = new Date()
    const entry = this._guestlist.find(a => a.login === login)
    if (entry !== undefined) { return 'Already guest' }
    const res = await Client.call('AddGuest', [{ string: login }])
    if (res instanceof Error) { return res }
    const obj = {
      login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login
    }
    this._guestlist.push(obj)
    await this.guestlistRepo.add(login, date, caller.login)
    Events.emit('AddGuest', obj)
    Logger.info(`${caller.nickname} (${caller.login}) has added ${login} to guestlist`)
    Client.callNoRes('SaveGuestList', [{ string: this.guestlistFile }])
    return true
  }

  /**
   * Removes a player from server guestlist, saves it and deletes him from guestlist table
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successful, false if caller privilege is too low 
   * 'Player not in guestlist' if player was not in the guestlist, Error if dedicated server call fails
   */
  static async removeGuest(login: string, caller?: { login: string, privilege: number, nickname: string }):
    Promise<boolean | 'Player not in guestlist' | Error> {
    if (caller !== undefined && caller.privilege < this.privileges.addGuest) { return false }
    const guestIndex = this._guestlist.findIndex(a => a.login === login)
    if (guestIndex === -1) { return 'Player not in guestlist' }
    const res = await Client.call('RemoveGuest', [{ string: login }])
    if (res instanceof Error) { return res }
    const obj = this._guestlist[guestIndex]
    this._guestlist.splice(guestIndex, 1)
    await this.guestlistRepo.remove(login)
    Events.emit('RemoveGuest', obj)
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has removed ${login} from guestlist`)
    } else {
      Logger.info(`${login} has been removed from guestlist`)
    }
    Client.callNoRes('SaveGuestList', [{ string: this.guestlistFile }])
    return true
  }

  private static async updatePrivilegeArrays(): Promise<void> {
    // the idea was not to call the database but who cares ig
    this._oplist = await this.privilegeRepo.getOperators()
    this._adminlist = await this.privilegeRepo.getAdmins()
    this._masteradminlist = await this.privilegeRepo.getMasteradmins()
  }

  /**
   * Gets ban information for given login
   * @param login Player login
   * @returns Ban object or undefined if the player isn't banned
   */
  static getBan(login: string): Readonly<tm.BanlistEntry> | undefined
  /**
   * Gets multiple bans information for given logins
   * @param logins Array of player logins
   * @returns Array of ban objects
   */
  static getBan(logins: string[]): Readonly<tm.BanlistEntry>[]
  static getBan(logins: string | string[]): Readonly<tm.BanlistEntry> | Readonly<tm.BanlistEntry>[] | undefined {
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
  static getBlacklist(login: string): Readonly<tm.BlacklistEntry> | undefined
  /**
   * Gets multiple blacklists information for given logins
   * @param logins Array of player logins
   * @returns Array of blacklist objects
   */
  static getBlacklist(logins: string[]): Readonly<tm.BlacklistEntry>[]
  static getBlacklist(logins: string | string[]): Readonly<tm.BlacklistEntry> | Readonly<tm.BlacklistEntry>[] | undefined {
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
  static getMute(login: string): Readonly<tm.MutelistEntry> | undefined
  /**
   * Gets multiple mutes information for given logins
   * @param logins Array of player logins
   * @returns Array of mute objects
   */
  static getMute(logins: string[]): Readonly<tm.MutelistEntry>[]
  static getMute(logins: string | string[]): Readonly<tm.MutelistEntry> | Readonly<tm.MutelistEntry>[] | undefined {
    if (typeof logins === 'string') {
      return this.mutelist.find(a => a.login === logins)
    }
    return this.mutelist.filter(a => logins.includes(a.login))
  }

  /**
   * Gets guest information for given login.
   * @param login Player login
   * @returns Guest object or undefined if the player isn't in the guestlist
   */
  static getGuest(login: string): Readonly<tm.GuestlistEntry> | undefined
  /**
   * Gets multiple guests information for given logins.
   * @param logins Array of player logins
   * @returns Array of guest objects
   */
  static getGuest(logins: string[]): Readonly<tm.GuestlistEntry>[]
  static getGuest(logins: string | string[]): Readonly<tm.GuestlistEntry> | Readonly<tm.GuestlistEntry>[] | undefined {
    if (typeof logins === 'string') {
      return this._guestlist.find(a => a.login === logins)
    }
    return this._guestlist.filter(a => logins.includes(a.login))
  }

  /**
   * Banned players.
   */
  static get banlist(): Readonly<tm.BanlistEntry>[] {
    return [...this.serverBanlist, ...this.banOnJoin]
  }

  /**
   * Blacklisted players.
   */
  static get blacklist(): Readonly<tm.BlacklistEntry>[] {
    return [...this._blacklist]
  }

  /**
   * Muted players.
   */
  static get mutelist(): Readonly<tm.MutelistEntry>[] {
    return [...this.serverMutelist, ...this.muteOnJoin]
  }

  /**
   * Server guests.
   */
  static get guestlist(): Readonly<tm.GuestlistEntry>[] {
    return [...this._guestlist]
  }

  /**
   * Server operators.
   */
  static get oplist(): Readonly<tm.PrivilegeEntry>[] {
    return [...this._oplist]
  }

  /**
   * Number of server operators.
   */
  static get opCount(): number {
    return this._oplist.length
  }

  /**
   * Server admins.
   */
  static get adminlist(): Readonly<tm.PrivilegeEntry>[] {
    return [...this._adminlist]
  }

  /**
   * Number of server admins.
   */
  static get adminCount(): number {
    return this._adminlist.length
  }

  /**
   * Server masteradmins.
   */
  static get masteradminlist(): Readonly<tm.PrivilegeEntry>[] {
    return [...this._masteradminlist]
  }

  /**
   * Number of server masteradmins.
   */
  static get masteradminCount(): number {
    return this._masteradminlist.length
  }

  /**
   * Number of banned players
   */
  static get banCount(): number {
    return this.serverBanlist.length + this.banOnJoin.length
  }

  /**
   * Number of blacklisted players
   */
  static get blacklistCount(): number {
    return this._blacklist.length
  }

  /**
   * Number of muted players
   */
  static get muteCount(): number {
    return this.serverMutelist.length + this.muteOnJoin.length
  }

  /**
   * Number of guests
   */
  static get guestCount(): number {
    return this._guestlist.length
  }

}
