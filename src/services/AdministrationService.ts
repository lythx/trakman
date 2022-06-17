import { AdministrationRepository } from "../database/AdministrationRepository.js";


export class AdministrationService {

    private static repo: AdministrationRepository
    private static readonly _banlist: { readonly ip: string, readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
    private static readonly _blacklist: { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
    private static readonly _mutelist: { readonly login: string, readonly date: Date, readonly callerLogin: string, readonly reason?: string, readonly expireDate?: Date }[] = []
    private static readonly _guestlist: { readonly login: string, readonly date: Date, readonly callerLogin: string }[] = []

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
            for (const e of this._banlist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
                this.removeFromBanlist(e.login)
            }
            for (const e of this._blacklist.filter(a => a.expireDate !== undefined && a.expireDate < date)) {
                this.removeFromBlacklist(e.login)
            }
        }, 5000)
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

    static async addToGuestlist(login: string, callerLogin: string) {
        const date = new Date()
        this._guestlist.push({ login, date, callerLogin })
        await this.repo.addToGuestlist(login, date, callerLogin)
    }

    static async removeFromGuestlist(login: string) {
        this._guestlist.splice(this._guestlist.findIndex(a => a.login === login), 1)
        await this.repo.removeFromGuestlist(login)
    }

}