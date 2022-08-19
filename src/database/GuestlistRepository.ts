import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'

const createQuery: string = `CREATE TABLE IF NOT EXISTS guestlist(
    login VARCHAR(25) NOT NULL,
    date TIMESTAMP NOT NULL,
    caller_id INT4 NOT NULL,
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
}

const playerRepo = new PlayerRepository()

export class GuestlistRepository extends Repository {

  async initialize(): Promise<void> {
    playerRepo.initialize()
    await super.initialize(createQuery)
  }

  async get(): Promise<TMGuestlistEntry[]> {
    const query: string = `SELECT guestlist.login, player.nickname, date, caller.login AS caller_login, 
    caller.nickname AS caller_nickname FROM guestlist
    JOIN players AS caller ON caller.id=guestlist.caller_id
    LEFT JOIN players AS player ON player.login=guestlist.login`
    return (await this.query(query)).map(a => this.constructGuestlistObject(a))
  }

  async add(login: string, date: Date, callerLogin: string): Promise<void> {
    const query: string = `INSERT INTO guestlist(login, date, caller_id) 
    VALUES($1, $2, $3);`
    const callerId = playerRepo.getId(callerLogin)
    await this.query(query, login, date, callerId)
  }

  async update(login: string, date: Date, callerLogin: string): Promise<void> {
    const query: string = `UPDATE guestlist SET date=$1, caller=$2 WHERE login=$3;`
    await this.query(query, date, callerLogin, login)
  }

  async remove(login: string): Promise<void> {
    const query: string = `DELETE FROM guestlist WHERE login=$1;`
    await this.query(query, login)
  }

  private constructGuestlistObject(entry: TableEntry): TMGuestlistEntry {
    return {
      login: entry.login,
      nickname: entry.nickname ?? undefined,
      date: entry.date,
      callerLogin: entry.caller_login,
      callerNickname: entry.caller_nickname
    }
  }

}
