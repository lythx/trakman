import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { Logger } from '../Logger.js'

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

export class MutelistRepository extends Repository {

  async get(): Promise<tm.MutelistEntry[]> {
    const query: string = `SELECT mutelist.login, player.nickname, date, caller.login AS caller_login, 
    caller.nickname AS caller_nickname, reason, expires FROM mutelist
    JOIN players AS caller ON caller.id=mutelist.caller_id
    LEFT JOIN players AS player ON player.login=mutelist.login`
    return (await this.query(query)).map(a => this.constructMutelistObject(a))
  }

  async add(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO mutelist(login, date, caller_id, reason, expires) 
    VALUES($1, $2, $3, $4, $5);`
    const callerId = await playerRepo.getId(callerLogin)
    if (callerId === undefined) {
      Logger.error(`Failed to get callerId for player ${login} while inserting into mutelist table`)
      return
    }
    await this.query(query, login, date, callerId, reason?.slice(0, 150), expireDate)
  }

  async update(login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE mutelist SET date=$1, caller_id=$2, reason=$3, expires=$4 WHERE login=$5;`
    const callerId = await playerRepo.getId(callerLogin)
    if (callerId === undefined) {
      Logger.error(`Failed to get callerId for player ${login} while updating mutelist table`)
      return
    }
    await this.query(query, date, callerId, reason, expireDate, login)
  }

  async remove(login: string): Promise<void> {
    const query: string = `DELETE FROM mutelist WHERE login=$1;`
    await this.query(query, login)
  }

  private constructMutelistObject(entry: TableEntry): tm.MutelistEntry {
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
