import { Repository } from './OldRepository.js'

const createQueries: string[] = [
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
