import { Logger } from "../Logger.js";
import { Client } from "../client/Client.js";
import { AdministrationRepository } from "../database/AdministrationRepository.js";
import CONFIG from "../../config.json" assert { type: 'json' }
import { PlayerService } from "./PlayerService.js";

export class AdministrationService {

  private static readonly repo: AdministrationRepository = new AdministrationRepository()
  private static readonly _banlist: { readonly ip: string, readonly login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date }[] = []
  private static readonly _blacklist: { readonly login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date }[] = []
  private static readonly _mutelist: { readonly login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date }[] = []
  private static readonly _guestlist: { readonly login: string, date: Date, callerLogin: string }[] = []
  private static readonly guestListFile = CONFIG.guestlistFilePath

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    const banlist = await this.repo.getBanlist()
    for (const e of banlist) {
      this._banlist.push({ ip: e.ip, login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason ?? undefined, expireDate: e.expires ?? undefined })
    }
    const blacklist = await this.repo.getBlacklist()
    for (const e of blacklist) {
      this._blacklist.push({ login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason ?? undefined, expireDate: e.expires ?? undefined })
    }
    const mutelist = await this.repo.getMutelist()
    for (const e of mutelist) {
      this._mutelist.push({ login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason ?? undefined, expireDate: e.expires ?? undefined })
    }
    const guestlist = await this.repo.getGuestlist()
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

  static get banlist(): { readonly ip: string, readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] {
    return [...this._banlist]
  }

  static addToBanlist(ip: string, login: string, callerLogin: string, reason?: string, expireDate?: Date): void {
    const date: Date = new Date()
    const entry = this._banlist.find(a => a.login === login && a.ip === ip)
    const reasonString: string = reason === undefined ? 'No reason specified' : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = callerLogin
      entry.reason = reason
      entry.expireDate = expireDate
      void this.repo.updateBanList(ip, login, date, callerLogin, reason, expireDate)
      Logger.info(`${callerLogin} has banned ${login} with ip ${ip}`, durationString, reasonString)
      return
    }
    this._banlist.push({ ip, login, date, callerLogin, reason, expireDate })
    void this.repo.addToBanlist(ip, login, date, callerLogin, reason, expireDate)
    Logger.info(`${callerLogin} has banned ${login} with ip ${ip}`, durationString, reasonString)
  }

  static removeFromBanlist(login: string, callerLogin?: string): boolean { // TODO HANDLE MULTIPLE IPS REMOVAL
    const index = this._banlist.findIndex(a => a.login === login)
    if (index === -1) { return false }
    this._banlist.splice(index, 1)
    void this.repo.removeFromBanlist(login)
    if (callerLogin !== undefined) {
      Logger.info(`${callerLogin} has unbanned ${login}`)
    } else {
      Logger.info(`${login} has been unbanned`)
    }
    return true
  }

  static get blacklist(): { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] {
    return [...this._blacklist]
  }

  static addToBlacklist(login: string, callerLogin: string, reason?: string, expireDate?: Date): void {
    const date: Date = new Date()
    const entry = this._blacklist.find(a => a.login === login)
    const reasonString: string = reason === undefined ? 'No reason specified' : ` Reason: ${reason}`
    const durationString: string = expireDate === undefined ? 'No expire date specified' : ` Expire date: ${expireDate.toUTCString()}`
    if (entry !== undefined) {
      entry.callerLogin = callerLogin
      entry.reason = reason
      entry.expireDate = expireDate
      void this.repo.updateBlacklist(login, date, callerLogin, reason, expireDate)
      Logger.info(`${callerLogin} has blacklisted ${login}`, durationString, reasonString)
      return
    }
    this._blacklist.push({ login, date, callerLogin, reason, expireDate })
    void this.repo.addToBlacklist(login, date, callerLogin, reason, expireDate)
    Logger.info(`${callerLogin} has blacklisted ${login}`, durationString, reasonString)
  }

  static removeFromBlacklist(login: string, callerLogin?: string): boolean {
    const index = this._blacklist.findIndex(a => a.login === login)
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
    const index = this._mutelist.findIndex(a => a.login === login)
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
    const index = this._guestlist.findIndex(a => a.login === login)
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
    for (const e of PlayerService.players) {
      if (this._banlist.some(a => a.login === e.login)) {
        await Client.call('Kick', [{ string: e.login }])
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
        this.removeFromBanlist(e.login)
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