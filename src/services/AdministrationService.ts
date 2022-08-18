import { Logger } from "../Logger.js";
import { Client } from "../client/Client.js";
import { AdministrationRepository } from "../database/AdministrationRepository.js";
import CONFIG from "../../config.json" assert { type: 'json' }
import { PlayerService } from "./PlayerService.js";
import { BanlistRepository } from '../database/BanlistRepository.js'
import { BlacklistRepository } from '../database/BlacklistRepository.js'

export class AdministrationService {

  private static readonly repo: AdministrationRepository = new AdministrationRepository()
  private static readonly banlistRepo = new BanlistRepository()
  private static readonly blacklistRepo = new BlacklistRepository()
  private static _banlist: TMBanlistEntry[] = []
  private static _blacklist: TMBlacklistEntry[] = []
  private static readonly _mutelist: { readonly login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date }[] = []
  private static readonly _guestlist: { readonly login: string, date: Date, callerLogin: string }[] = []
  private static readonly guestListFile: string = CONFIG.guestlistFilePath

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    this._banlist = await this.banlistRepo.get()
    this._blacklist = await this.blacklistRepo.get()
    const mutelist: MutelistDBEntry[] = await this.repo.getMutelist()
    for (const e of mutelist) {
      this._mutelist.push({ login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason ?? undefined, expireDate: e.expires ?? undefined })
    }
    const guestlist: GuestlistDBEntry[] = await this.repo.getGuestlist()
    for (const e of guestlist) {
      this._guestlist.push({ login: e.login, date: e.date, callerLogin: e.caller })
    }
    await this.fixGuestlistCoherence()
    await this.fixMutelistCoherence()
    await this.fixBanlistCoherence()
    await this.fixBlacklistCoherence()
    this.poll()
  }

  static checkIfCanJoin(login: string, ip: string): true | { banMethod: 'ban' | 'blacklist', reason?: string } {
    const banned = this._banlist.find(a => a.ip === ip)
    if (banned !== undefined) {
      return { banMethod: 'ban', reason: banned.reason }
    }
    const blacklisted = this._blacklist.find(a => a.login === login)
    if (blacklisted !== undefined) {
      return { banMethod: 'blacklist', reason: blacklisted.reason }
    }
    return true
  }

  static get banlist(): TMBanlistEntry[] {
    return [...this._banlist]
  }

  /**
   * Bans a player
   * @param ip Player IP address
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @param reason Optional ban reason
   * @param expireDate Optional ban expire date
   * @returns True if successfull, Error if server call fails
   */
  static async ban(ip: string, login: string, caller: { login: string, nickname: string }, nickname?: string, reason?: string, expireDate?: Date): Promise<true | Error> {
    const date: Date = new Date()
    const entry = this._banlist.find(a => a.login === login && a.ip === ip)
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
      return true
    }
    const params: CallParams[] = reason === undefined ? [{ string: login }, { boolean: true }] :
      [{ string: login }, { string: reason }, { boolean: true }]
    const banRes = await Client.call('BanAndBlackList', params)
    if (banRes instanceof Error) { return banRes }
    this._banlist.push({
      ip, login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    })
    void this.banlistRepo.add(ip, login, date, caller.login, reason, expireDate)
    Logger.info(`${caller.nickname} (${caller.login}) has banned ${login} with ip ${ip}`, durationString, reasonString)
    Client.callNoRes('Kick', [{ string: login }])
    return true
  }

  /**
   * Unbans a player
   * @param login Player login
   * @param caller Caller player object
   * @returns True if successfull, false if player was not banned, Error if dedicated server call fails
   */
  static async unban(login: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    if (!this._banlist.some(a => a.login === login)) { return false }
    const unbanRes = await Client.call('UnBan', [{ string: login }])
    if (unbanRes instanceof Error) { return unbanRes }
    this._banlist = this._banlist.filter(a => a.login !== login)
    void this.banlistRepo.remove(login)
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has unbanned ${login}`)
    } else {
      Logger.info(`${login} has been unbanned`)
    }
    return true
  }

  static get blacklist(): TMBlacklistEntry[] {
    return [...this._blacklist]
  }

  /**
   * Blacklists a player
   * @param login Player login
   * @param caller Caller player object
   * @param nickname Optional player nickname
   * @param reason Optional ban reason
   * @param expireDate Optional ban expire date
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
      Logger.info(`${caller.nickname} (${caller.login}) has banned ${login}`, durationString, reasonString)
      return true
    }
    const blRes = await Client.call('BlackList', [{ string: login }])
    if (blRes instanceof Error) { return blRes }
    this._banlist.push({
      ip, login, nickname, date, callerNickname: caller.nickname,
      callerLogin: caller.login, reason, expireDate
    })
    void this.banlistRepo.add(ip, login, date, caller.login, reason, expireDate)
    Logger.info(`${caller.nickname} (${caller.login}) has banned ${login}`, durationString, reasonString)
    Client.callNoRes('Kick', [{ string: login }])
    return true
  }

  static removeFromBlacklist(login: string, callerLogin?: string): boolean {
    const index: number = this._blacklist.findIndex(a => a.login === login)
    if (index === -1) { return false }
    this._blacklist.splice(index, 1)
    void this.repo.removeFromBlacklist(login)
    if (callerLogin !== undefined) {
      Logger.info(`${callerLogin} has unblacklisted ${login}`)
    } else {
      Logger.info(`${login} has been unblacklisted`)
    }
    return true
  }

  static get mutelist(): { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] {
    return [...this._mutelist]
  }

  static async addToMutelist(login: string, callerLogin: string, reason?: string, expireDate?: Date): Promise<true | Error> {
    const date: Date = new Date()
    const entry = this._mutelist.find(a => a.login === login)
    const reasonString: string = reason === undefined ? 'No reason specified' : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = callerLogin
      entry.reason = reason
      entry.expireDate = expireDate
      void this.repo.updateMutelist(login, date, callerLogin, reason, expireDate)
      Logger.info(`${callerLogin} has muted ${login}`, durationString, reasonString)
      return true
    }
    const res: any[] | Error = await Client.call('Ignore', [{ string: login }])
    if (res instanceof Error) { return res }
    this._mutelist.push({ login, date, callerLogin, reason, expireDate })
    void this.repo.addToMutelist(login, date, callerLogin, reason, expireDate)
    Logger.info(`${callerLogin} has muted ${login}`, durationString, reasonString)
    return true
  }

  static async removeFromMutelist(login: string, callerLogin?: string): Promise<boolean | Error> {
    const index: number = this._mutelist.findIndex(a => a.login === login)
    if (index === -1) { return false }
    this._mutelist.splice(index, 1)
    const mute: any[] | Error = await Client.call('UnIgnore', [{ string: login }])
    if (mute instanceof Error) { return mute }
    await this.repo.removeFromMutelist(login)
    if (callerLogin !== undefined) {
      Logger.info(`${callerLogin} has unmuted ${login}`)
    } else {
      Logger.info(`${login} has been unmuted`)
    }
    return true
  }

  static get guestlist(): { readonly login: string, readonly date: Date, readonly callerLogin: string }[] {
    return [...this._guestlist]
  }

  static async addToGuestlist(login: string, callerLogin: string): Promise<boolean | Error> {
    if (this._guestlist.some(a => a.login === login) === true) { return false }
    const date: Date = new Date()
    const res: any[] | Error = await Client.call('AddGuest', [{ string: login }])
    if (res instanceof Error) { return res }
    this._guestlist.push({ login, date, callerLogin })
    Client.callNoRes('SaveGuestList', [{ string: this.guestListFile }])
    void this.repo.addToGuestlist(login, date, callerLogin)
    Logger.info(`${callerLogin} has added ${login} to guestlist`)
    return true
  }

  static async removeFromGuestlist(login: string, callerLogin?: string): Promise<boolean | Error> {
    const index: number = this._guestlist.findIndex(a => a.login === login)
    if (index === -1) { return false }
    const res: any[] | Error = await Client.call('RemoveGuest', [{ string: login }])
    if (res instanceof Error) { return res }
    Client.callNoRes('SaveGuestList', [{ string: this.guestListFile }])
    this._guestlist.splice(index, 1)
    void this.repo.removeFromGuestlist(login)
    if (callerLogin !== undefined) {
      Logger.info(`${callerLogin} has removed ${login} from guestlist`)
    } else {
      Logger.info(`${login} was removed from guestlist`)
    }
    return true
  }

  private static async fixBanlistCoherence(): Promise<void> {
    const banlist: any[] | Error = await Client.call('GetBanList', [{ int: 5000 }, { int: 0 }])
    if (banlist instanceof Error) {
      await Logger.fatal('Failed to fetch banlist', 'Server responded with error:', banlist.message)
      return
    }
    for (const login of this._banlist.map(a => a.login)) {
      if (!banlist.some((a: any): boolean => a.Login === login)) {
        const res: any[] | Error = await Client.call('BanAndBlackList', [{ string: login }])
        if (res instanceof Error) {
          Logger.error(`Failed to add login ${login} to banlist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of banlist.map((a): any => a.Login)) {
      if (!this._banlist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('UnBan', [{ string: login }])
        if (res instanceof Error) {
          Logger.error(`Failed to remove login ${login} from banlist`, `Server responded with error:`, res.message)
        }
      }
    }
  }

  private static async fixBlacklistCoherence(): Promise<void> {
    for (const e of PlayerService.players) {
      if (this._blacklist.some(a => a.login === e.login)) {
        await Client.call('Kick', [{ string: e.login }])
      }
    }
  }

  private static async fixGuestlistCoherence(): Promise<void> {
    const guestList: any[] | Error = await Client.call('GetGuestList', [{ int: 5000 }, { int: 0 }])
    if (guestList instanceof Error) {
      await Logger.fatal('Failed to fetch guestlist', 'Server responded with error:', guestList.message)
      return
    }
    for (const login of this._guestlist.map(a => a.login)) {
      if (!guestList.some((a: any): boolean => a.Login === login)) {
        const res: any[] | Error = await Client.call('AddGuest', [{ string: login }])
        if (res instanceof Error) {
          Logger.error(`Failed to add login ${login} to guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of guestList.map((a): any => a.Login)) {
      if (!this._guestlist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('RemoveGuest', [{ string: login }])
        if (res instanceof Error) {
          Logger.error(`Failed to remove login ${login} from guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
    Client.callNoRes('SaveGuestList', [{ string: this.guestListFile }])
  }

  private static async fixMutelistCoherence(): Promise<void> {
    const muteList: any[] | Error = await Client.call('GetIgnoreList', [{ int: 5000 }, { int: 0 }])
    if (muteList instanceof Error) {
      await Logger.fatal('Failed to fetch mutelist', 'Server responded with error:', muteList.message)
      return
    }
    for (const login of this._mutelist.map(a => a.login)) {
      if (!muteList.some((a: any): boolean => a.Login === login)) {
        const res: any[] | Error = await Client.call('Ignore', [{ string: login }])
        if (res instanceof Error) {
          Logger.error(`Failed to add login ${login} to mutelist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of muteList.map((a): any => a.Login)) {
      if (!this._mutelist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('UnIgnore', [{ string: login }])
        if (res instanceof Error) {
          Logger.error(`Failed to remove login ${login} from mutelist`, `Server responded with error:`, res.message)
        }
      }
    }
  }

  private static poll(): void {
    setInterval((): void => {
      const date: Date = new Date()
      for (const e of this._banlist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
        this.unban(e.login)
      }
      for (const e of this._blacklist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
        this.removeFromBlacklist(e.login)
      }
      for (const e of this._mutelist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
        this.removeFromMutelist(e.login)
      }
    }, 5000)
  }

}