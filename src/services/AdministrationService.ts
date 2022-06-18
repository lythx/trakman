import { ErrorHandler } from "../ErrorHandler.js";
import { Client } from "../Client.js";
import { AdministrationRepository } from "../database/AdministrationRepository.js";


export class AdministrationService {

    private static repo: AdministrationRepository
    private static readonly _banlist: { readonly ip: string, readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
    private static readonly _blacklist: { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
    private static readonly _mutelist: { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
    private static readonly _guestlist: { readonly login: string, readonly date: Date, readonly callerLogin: string }[] = []

    // MUTELIST DOESNT DO ANYTHING YET, WILL IMPLEMENT AFTER WE DO MANUALCHATROUTING
    static async initialize() {
        this.repo = new AdministrationRepository()
        await this.repo.initialize()
        let res = await this.repo.getBanlist()
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
        setInterval(() => {
            const date = new Date()
            console.log(this._banlist?.[0]?.expireDate)
            for (const e of this._banlist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
                this.removeFromBanlist(e.login)
            }
            for (const e of this._blacklist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
                this.removeFromBlacklist(e.login)
            }
        }, 5000)
        const guestList = await Client.call('GetGuestList', [{ int: 5000 }, { int: 0 }])
        if (guestList instanceof Error) {
            ErrorHandler.fatal('Failed to fetch guestlist', 'Server responded with error:', guestList.message)
            return
        }
        for (const login of this._guestlist.map(a => a.login)) {
            if (!guestList.some((a: any) => a.Login === login)) {
                const res = await Client.call('AddGuest', [{ string: login }])
                if (res instanceof Error) {
                    ErrorHandler.error(`Failed to add login ${login} to guestlist`, `Server responded with error:`, res.message)
                }
            }
        }
        for (const login of guestList.map((a: any) => a.Login)) {
            if (!this._guestlist.some((a: any) => a.login === login)) {
                const res = await Client.call('RemoveGuest', [{ string: login }])
                if (res instanceof Error) {
                    ErrorHandler.error(`Failed to remove login ${login} from guestlist`, `Server responded with error:`, res.message)
                }
            }
        }
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
        console.log(this._banlist)
        return [...this._banlist]
    }

    static async addToBanlist(ip: string, login: string, callerLogin: string, reason?: string, expireDate?: Date) {
        const date = new Date()
        this._banlist.push({ ip, login, date, callerLogin, reason, expireDate })
        await this.repo.addToBanlist(ip, login, date, callerLogin, reason, expireDate)
    }

    static async removeFromBanlist(login: string) {
        this._banlist.splice(this._banlist.findIndex(a => a.login === login), 1)
        await this.repo.removeFromBanlist(login)
    }

    static get blacklist() {
        return [...this._blacklist]
    }

    static async addToBlacklist(login: string, callerLogin: string, reason?: string, expireDate?: Date) {
        const date = new Date()
        this._blacklist.push({ login, date, callerLogin, reason, expireDate })
        await this.repo.addToBlacklist(login, date, callerLogin, reason, expireDate)
    }

    static async removeFromBlacklist(login: string) {
        this._blacklist.splice(this._blacklist.findIndex(a => a.login === login), 1)
        await this.repo.removeFromBlacklist(login)
    }

    static get mutelist() {
        return [...this._mutelist]
    }

    static async addToMutelist(login: string, callerLogin: string, reason?: string, expireDate?: Date) {
        const date = new Date()
        this._mutelist.push({ login, date, callerLogin, reason, expireDate })
        await this.repo.addToMutelist(login, date, callerLogin, reason, expireDate)
    }

    static async removeFromMutelist(login: string) {
        this._mutelist.splice(this._mutelist.findIndex(a => a.login === login), 1)
        await this.repo.removeFromMutelist(login)
    }

    static get guestlist() {
        return [...this._guestlist]
    }

    static async addToGuestlist(login: string, callerLogin: string): Promise<void | Error> {
        if (this._guestlist.some(a => a.login === login)) { return }
        const date = new Date()
        // TODO do multicall after implementing multicall errors, and check loading guestlist from different files
        const add = await Client.call('AddGuest', [{ string: 'login' }])
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
        const remove = await Client.call('RemoveGuest', [{ string: 'login' }])
        if (remove instanceof Error) {
            return remove
        }
        Client.callNoRes('SaveGuestList', [{ string: 'guestlist.txt' }]) // No res because I have no idea how to handle it adding and then not saving
        this._guestlist.splice(this._guestlist.findIndex(a => a.login === login), 1)
        await this.repo.removeFromGuestlist(login)
    }

}