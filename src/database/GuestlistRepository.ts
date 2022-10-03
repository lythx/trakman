import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'

interface TableEntry {
  readonly login: string
  readonly nickname: string | null
  readonly date: Date
  readonly caller_login: string
  readonly caller_nickname: string
}

const playerRepo = new PlayerRepository()

export class GuestlistRepository extends Repository {

  async get(): Promise<tm.GuestlistEntry[]> {
    const query: string = `SELECT guestlist.login, player.nickname, date, caller.login AS caller_login, 
    caller.nickname AS caller_nickname FROM guestlist
    JOIN players AS caller ON caller.id=guestlist.caller_id
    LEFT JOIN players AS player ON player.login=guestlist.login`
    return (await this.query(query)).map(a => this.constructGuestlistObject(a))
  }

  async add(login: string, date: Date, callerLogin: string): Promise<void> {
    const query: string = `INSERT INTO guestlist(login, date, caller_id) 
    VALUES($1, $2, $3);`
    const callerId = await playerRepo.getId(callerLogin)
    await this.query(query, login, date, callerId)
  }

  async update(login: string, date: Date, callerLogin: string): Promise<void> {
    const query: string = `UPDATE guestlist SET date=$1, caller_id=$2 WHERE login=$3;`
    const callerId = await playerRepo.getId(callerLogin)
    await this.query(query, date, callerId, login)
  }

  async remove(login: string): Promise<void> {
    const query: string = `DELETE FROM guestlist WHERE login=$1;`
    await this.query(query, login)
  }

  private constructGuestlistObject(entry: TableEntry): tm.GuestlistEntry {
    return {
      login: entry.login,
      nickname: entry.nickname ?? undefined,
      date: entry.date,
      callerLogin: entry.caller_login,
      callerNickname: entry.caller_nickname
    }
  }

}
