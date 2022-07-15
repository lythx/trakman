import { ErrorHandler } from "../ErrorHandler.js";
import { Client } from "../client/Client.js";
import { AdministrationRepository } from "../database/AdministrationRepository.js";


export class AdministrationService {

  private static repo: AdministrationRepository
  private static readonly _banlist: { readonly ip: string, readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
  private static readonly _blacklist: { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
  private static readonly _mutelist: { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
  private static readonly _guestlist: { readonly login: string, readonly date: Date, readonly callerLogin: string }[] = []

  // MUTELIST DOESNT DO ANYTHING YET, WILL IMPLEMENT AFTER WE DO MANUALCHATROUTING
  static async initialize(): Promise<void> {
    this.repo = new AdministrationRepository()
    await this.repo.initialize()
    let res: any[] = await this.repo.getBanlist()
    for (const e of res) {
      this._banlist.push({ ip: e.ip, login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason, expireDate: e.expires })
    }
    res = await this.repo.getBlacklist()
    for (const e of res) {
      this._blacklist.push({ login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason, expireDate: e.expires })
    }
    res = await this.repo.getMutelist()
    for (const e of res) {
      this._mutelist.push({ login: e.login, date: e.date, callerLogin: e.caller, reason: e.reason, expireDate: e.expires })
    }
    res = await this.repo.getGuestlist()
    for (const e of res) {
      this._guestlist.push({ login: e.login, date: e.date, callerLogin: e.callerLogin })
    }
    this.poll()
    await this.fixGuestListCoherence()
    await this.fixMutelistCoherence()
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

  static get banlist() {
    return [...this._banlist]
  }

  static async addToBanlist(ip: string, login: string, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const date: Date = new Date()
    this._banlist.push({ ip, login, date, callerLogin, reason, expireDate })
    await this.repo.addToBanlist(ip, login, date, callerLogin, reason, expireDate)
  }

  static async removeFromBanlist(login: string): Promise<void> {
    this._banlist.splice(this._banlist.findIndex(a => a.login === login), 1)
    await this.repo.removeFromBanlist(login)
  }

  static get blacklist() {
    return [...this._blacklist]
  }

  static async addToBlacklist(login: string, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const date: Date = new Date()
    this._blacklist.push({ login, date, callerLogin, reason, expireDate })
    await this.repo.addToBlacklist(login, date, callerLogin, reason, expireDate)
  }

  static async removeFromBlacklist(login: string): Promise<void> {
    this._blacklist.splice(this._blacklist.findIndex(a => a.login === login), 1)
    await this.repo.removeFromBlacklist(login)
  }

  static get mutelist() {
    return [...this._mutelist]
  }

  static async addToMutelist(login: string, callerLogin: string, reason?: string, expireDate?: Date): Promise<void | Error> {
    const date: Date = new Date()
    this._mutelist.push({ login, date, callerLogin, reason, expireDate })
    const mute: any[] | Error = await Client.call('Ignore', [{ string: login }])
    if (mute instanceof Error) {
      return mute
    }
    await this.repo.addToMutelist(login, date, callerLogin, reason, expireDate)
  }

  static async removeFromMutelist(login: string): Promise<void | Error> {
    this._mutelist.splice(this._mutelist.findIndex(a => a.login === login), 1)
    const mute: any[] | Error = await Client.call('UnIgnore', [{ string: login }])
    if (mute instanceof Error) {
      return mute
    }
    await this.repo.removeFromMutelist(login)
  }

  static get guestlist() {
    return [...this._guestlist]
  }

  static async addToGuestlist(login: string, callerLogin: string): Promise<void | Error> {
    if (this._guestlist.some(a => a.login === login)) { return }
    const date: Date = new Date()
    // TODO do multicall after implementing multicall errors, and check loading guestlist from different files
    const add: any[] | Error = await Client.call('AddGuest', [{ string: login }])
    if (add instanceof Error) {
      return add
    }
    Client.callNoRes('SaveGuestList', [{ string: 'guestlist.txt' }]) // No res because I have no idea how to handle it adding and then not saving
    this._guestlist.push({ login, date, callerLogin })
    await this.repo.addToGuestlist(login, date, callerLogin)
  }

  static async removeFromGuestlist(login: string): Promise<void | Error> {
    if (!this._guestlist.some(a => a.login === login)) { return }
    // TODO do multicall after implementing multicall errors, and check loading guestlist from different files
    const remove: any[] | Error = await Client.call('RemoveGuest', [{ string: login }])
    if (remove instanceof Error) {
      return remove
    }
    Client.callNoRes('SaveGuestList', [{ string: 'guestlist.txt' }]) // No res because I have no idea how to handle it adding and then not saving
    this._guestlist.splice(this._guestlist.findIndex(a => a.login === login), 1)
    await this.repo.removeFromGuestlist(login)
  }

  private static async fixGuestListCoherence() {
    const guestList: any[] | Error = await Client.call('GetGuestList', [{ int: 5000 }, { int: 0 }])
    if (guestList instanceof Error) {
      ErrorHandler.fatal('Failed to fetch guestlist', 'Server responded with error:', guestList.message)
      return
    }
    for (const login of this._guestlist.map(a => a.login)) {
      if (!guestList.some((a: any): boolean => a.Login === login)) {
        const res: any[] | Error = await Client.call('AddGuest', [{ string: login }])
        if (res instanceof Error) {
          ErrorHandler.error(`Failed to add login ${login} to guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of guestList.map((a): any => a.Login)) {
      if (!this._guestlist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('RemoveGuest', [{ string: login }])
        if (res instanceof Error) {
          ErrorHandler.error(`Failed to remove login ${login} from guestlist`, `Server responded with error:`, res.message)
        }
      }
    }
  }

  private static async fixMutelistCoherence() {
    const muteList: any[] | Error = await Client.call('GetIgnoreList', [{ int: 5000 }, { int: 0 }])
    if (muteList instanceof Error) {
      ErrorHandler.fatal('Failed to fetch mutelist', 'Server responded with error:', muteList.message)
      return
    }
    for (const login of this._mutelist.map(a => a.login)) {
      if (!muteList.some((a: any): boolean => a.Login === login)) {
        const res: any[] | Error = await Client.call('Ignore', [{ string: login }])
        if (res instanceof Error) {
          ErrorHandler.error(`Failed to add login ${login} to mutelist`, `Server responded with error:`, res.message)
        }
      }
    }
    for (const login of muteList.map((a): any => a.Login)) {
      if (!this._mutelist.some((a: any): boolean => a.login === login)) {
        const res: any[] | Error = await Client.call('UnIgnore', [{ string: login }])
        if (res instanceof Error) {
          ErrorHandler.error(`Failed to remove login ${login} from mutelist`, `Server responded with error:`, res.message)
        }
      }
    }
  }

  private static poll() {
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