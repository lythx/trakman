import { Repository } from './Repository.js'

const createQueries = [
    `CREATE TABLE IF NOT EXISTS banlist(
    ip VARCHAR(15) NOT NULL,
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller VARCHAR(25) NOT NULL,
    reason VARCHAR(250),
    expires TIMESTAMP,
    PRIMARY KEY(ip, login)
);`,
    `CREATE TABLE IF NOT EXISTS blacklist(
    login VARCHAR(25) PRIMARY KEY NOT NULL,
    date TIMESTAMP NOT NULL,
    caller VARCHAR(25) NOT NULL,
    reason VARCHAR(250),
    expires TIMESTAMP
);`,
    `CREATE TABLE IF NOT EXISTS mutelist(
    login VARCHAR(25) PRIMARY KEY NOT NULL,
    date TIMESTAMP NOT NULL,
    caller VARCHAR(25) NOT NULL,
    reason VARCHAR(250),
    expires TIMESTAMP
);`,
    `CREATE TABLE IF NOT EXISTS guestlist(
    login VARCHAR(25) PRIMARY KEY NOT NULL,
    date TIMESTAMP NOT NULL,
    caller VARCHAR(25) NOT NULL
);`
]

export class AdministrationRepository extends Repository {

    async initialize(): Promise<void> {
        await super.initialize()
        for (const createQuery of createQueries) {
            await this.db.query(createQuery)
        }
    }

    async getBanlist() {
        const query = `SELECT * FROM banlist;`
        const res = await this.db.query(query)
        return res.rows
    }

    async addToBanlist(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<any[]> {
        const query = `INSERT INTO banlist(ip, login, date, caller, reason, expires) VALUES ($1, $2, $3, $4, $5, $6);`
        const res = await this.db.query(query, [ip, login, date, callerLogin, reason, expireDate])
        return res.rows
    }

    async removeFromBanlist(login: string): Promise<any[]> {
        const query = `DELETE FROM banlist WHERE login=$1;`
        const res = await this.db.query(query, [login])
        return res.rows
    }

    async getBlacklist() {
        const query = `SELECT * FROM blacklist;`
        const res = await this.db.query(query)
        return res.rows
    }

    async addToBlacklist(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<any[]> {
        const query = `INSERT INTO blacklist(login, date, caller, reason, expires) VALUES ($1, $2, $3, $4, $5);`
        const res = await this.db.query(query, [login, date, callerLogin, reason, expireDate])
        return res.rows
    }

    async removeFromBlacklist(ip: string): Promise<any[]> {
        const query = `DELETE FROM blacklist WHERE login=$1;`
        const res = await this.db.query(query, [ip])
        return res.rows
    }

    async getMutelist() {
        const query = `SELECT * FROM mutelist;`
        const res = await this.db.query(query)
        return res.rows
    }

    async addToMutelist(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<any[]> {
        const query = `INSERT INTO mutelist(login, date, caller, reason, expires) VALUES ($1, $2, $3, $4, $5);`
        const res = await this.db.query(query, [login, date, callerLogin, reason, expireDate])
        return res.rows
    }

    async removeFromMutelist(ip: string): Promise<any[]> {
        const query = `DELETE FROM mutelist WHERE login=$1;`
        const res = await this.db.query(query, [ip])
        return res.rows
    }

    async getGuestlist() {
        const query = `SELECT * FROM guestlist;`
        const res = await this.db.query(query)
        return res.rows
    }

    async addToGuestlist(login: string, date: Date, callerLogin: string): Promise<any[]> {
        const query = `INSERT INTO guestlist(login, date, caller) VALUES ($1, $2, $3);`
        const res = await this.db.query(query, [login, date, callerLogin])
        return res.rows
    }

    async removeFromGuestlist(ip: string): Promise<any[]> {
        const query = `DELETE FROM guestlist WHERE login=$1;`
        const res = await this.db.query(query, [ip])
        return res.rows
    }

}
