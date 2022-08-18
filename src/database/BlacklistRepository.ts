import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'

const createQuery: string = `CREATE TABLE IF NOT EXISTS blacklist(
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
    reason VARCHAR(250),
    expires TIMESTAMP,
    PRIMARY KEY(login)
    CONSTRAINT fk_caller_id,
      FOREIGN KEY(caller_id)
	      REFERENCES players(id)
);`

interface TableEntry {
  readonly login: string
  readonly nickname: string | null
  readonly date: Date
  readonly caller_login: string
  readonly caller_nickname: string
  readonly reason: string | null
  readonly expires: Date | null
}

const playerRepo = new PlayerRepository()

export class BlacklistRepository extends Repository {

  async initialize(): Promise<void> {
    playerRepo.initialize()
    await super.initialize(createQuery)
  }

  async get(): Promise<TMBlacklistEntry[]> {
    const query: string = `SELECT blacklist.login, player.nickname, date, caller.login AS caller_login, 
    caller.nickname AS caller_nickname, reason, expires FROM blacklist
    JOIN players AS caller ON caller.id=blacklist.caller_id
    LEFT JOIN players; AS player ON player.login=blacklist.login`
    return (await this.query(query)).map(a => this.constructBlacklistObject(a))
  }

  async add(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO blacklist(login, date, caller_id, reason, expires) 
    VALUES($1, $2, $3, $4, $5);`
    const callerId = playerRepo.getId(callerLogin)
    await this.query(query, login, date, callerId, reason, expireDate)
  }

  async update(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE blacklist SET date=$1, caller=$2, reason=$3, expires=$4 WHERE login=$5;`
    await this.query(query, date, callerLogin, reason, expireDate, login)
  }

  async remove(login: string): Promise<void> {
    const query: string = `DELETE FROM blacklist WHERE login=$1;`
    await this.query(query, login)
  }

  private constructBlacklistObject(entry: TableEntry): TMBlacklistEntry {
    return {
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
