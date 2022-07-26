import { Repository } from './OldRepository.js'

const createQueries: string[] = [
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

  async getBanlist(): Promise<BanlistDBEntry[]> {
    const query: string = `SELECT * FROM banlist;`
    const res = await this.db.query(query)
    return res.rows
  }

  async addToBanlist(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO banlist(ip, login, date, caller, reason, expires) VALUES($1, $2, $3, $4, $5, $6);`
    await this.db.query(query, [ip, login, date, callerLogin, reason, expireDate])
  }

  async updateBanList(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE banlist SET date=$1, caller=$2, reason=$3, expires=$4 WHERE ip=$5 AND login=$6;`
    await this.db.query(query, [date, callerLogin, reason, expireDate, ip, login])
  }

  async removeFromBanlist(login: string): Promise<void> {
    const query: string = `DELETE FROM banlist WHERE login=$1;`
    await this.db.query(query, [login])
  }

  async getBlacklist(): Promise<BlacklistDBEntry[]> {
    const query: string = `SELECT * FROM blacklist;`
    const res = await this.db.query(query)
    return res.rows
  }

  async addToBlacklist(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO blacklist(login, date, caller, reason, expires) VALUES($1, $2, $3, $4, $5);`
    await this.db.query(query, [login, date, callerLogin, reason, expireDate])
  }

  async updateBlacklist(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE blacklist date=$1, caller=$2, reason=$3, expires=$4 WHERE login=$5;`
    await this.db.query(query, [date, callerLogin, reason, expireDate, login])
  }

  async removeFromBlacklist(ip: string): Promise<void> {
    const query: string = `DELETE FROM blacklist WHERE login=$1;`
    await this.db.query(query, [ip])
  }

  async getMutelist(): Promise<MutelistDBEntry[]> {
    const query: string = `SELECT * FROM mutelist;`
    const res = await this.db.query(query)
    return res.rows
  }

  async addToMutelist(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO mutelist(login, date, caller, reason, expires) VALUES($1, $2, $3, $4, $5);`
    await this.db.query(query, [login, date, callerLogin, reason, expireDate])
  }

  async updateMutelist(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE mutelist SET date=$1, caller=$2, reason=$3, expires=$4 WHERE login=$5;`
    await this.db.query(query, [date, callerLogin, reason, expireDate, login])
  }

  async removeFromMutelist(ip: string): Promise<void> {
    const query: string = `DELETE FROM mutelist WHERE login=$1;`
    await this.db.query(query, [ip])
  }

  async getGuestlist(): Promise<GuestlistDBEntry[]> {
    const query: string = `SELECT * FROM guestlist;`
    const res = await this.db.query(query)
    return res.rows
  }

  async addToGuestlist(login: string, date: Date, callerLogin: string): Promise<void> {
    const query: string = `INSERT INTO guestlist(login, date, caller) VALUES($1, $2, $3);`
    await this.db.query(query, [login, date, callerLogin])
  }

  async removeFromGuestlist(ip: string): Promise<void> {
    const query: string = `DELETE FROM guestlist WHERE login=$1;`
    await this.db.query(query, [ip])
  }

}
