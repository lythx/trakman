import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'

const createQuery: string = `CREATE TABLE IF NOT EXISTS banlist(
    ip VARCHAR(16) NOT NULL,
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
    reason VARCHAR(250),
    expires TIMESTAMP,
    PRIMARY KEY(ip, login)
    CONSTRAINT fk_caller_id,
      FOREIGN KEY(caller_id)
	      REFERENCES players(id)
);`

interface TableEntry {
  readonly ip: string
  readonly login: string
  readonly nickname: string | null
  readonly date: Date
  readonly caller_login: string
  readonly caller_nickname: string
  readonly reason: string | null
  readonly expires: Date | null
}

const playerRepo = new PlayerRepository()

export class BanlistRepository extends Repository {

  async initialize(): Promise<void> {
    playerRepo.initialize()
    await super.initialize(createQuery)
  }

  async get(): Promise<TMBanlistEntry[]> {
    const query: string = `SELECT ip, banlist.login, player.nickname, date, caller.login AS caller_login, 
    caller.nickname AS caller_nickname, reason, expires FROM banlist
    JOIN players AS caller ON caller.id=banlist.caller_id
    LEFT JOIN players AS player ON player.login=banlist.login`
    return (await this.query(query)).map(a => this.constructBanObject(a))
  }

  async add(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO banlist(ip, login, date, caller_id, reason, expires) 
    VALUES($1, $2, $3, $4, $5, $6);`
    const callerId = playerRepo.getId(callerLogin)
    await this.query(query, ip, login, date, callerId, reason, expireDate)
  }

  async update(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE banlist SET date=$1, caller=$2, reason=$3, expires=$4 WHERE ip=$5 AND login=$6;`
    await this.query(query, date, callerLogin, reason, expireDate, ip, login)
  }

  async remove(login: string): Promise<void> {
    const query: string = `DELETE FROM banlist WHERE login=$1;`
    await this.query(query, login)
  }

  private constructBanObject(entry: TableEntry): TMBanlistEntry {
    return {
      ip: entry.ip,
      login: entry.login,
      nickname: entry.nickname ?? undefined,
      date: entry.date,
      callerLogin: entry.caller_login,
      callerNickname: entry.caller_nickname,
      reason: entry.reason ?? undefined,
      expireDate: entry.expires ?? undefined
    }
  }

}
