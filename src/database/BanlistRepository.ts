import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { Logger } from '../Logger.js'

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

  async get(): Promise<tm.BanlistEntry[]> {
    const query: string = `SELECT ip, banlist.login, player.nickname, date, caller.login AS caller_login, 
    caller.nickname AS caller_nickname, reason, expires FROM banlist
    JOIN players AS caller ON caller.id=banlist.caller_id
    LEFT JOIN players AS player ON player.login=banlist.login`
    return (await this.query(query)).map(a => this.constructBanObject(a))
  }

  async add(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `INSERT INTO banlist(ip, login, date, caller_id, reason, expires) 
    VALUES($1, $2, $3, $4, $5, $6);`
    const callerId = await playerRepo.getId(callerLogin)
    if (callerId === undefined) {
      Logger.error(`Failed to get callerId for player ${login} while inserting into banlist table`)
      return
    }
    await this.query(query, ip, login, date, callerId, reason?.slice(0, 150), expireDate)
  }

  async update(ip: string, login: string, date: Date, callerLogin: string, reason?: string, expireDate?: Date): Promise<void> {
    const query: string = `UPDATE banlist SET date=$1, caller_id=$2, reason=$3, expires=$4 WHERE ip=$5 AND login=$6;`
    const callerId = await playerRepo.getId(callerLogin)
    if (callerId === undefined) {
      Logger.error(`Failed to get callerId for player ${login} while updating banlist table`)
      return
    }
    await this.query(query, date, callerId, reason, expireDate, ip, login)
  }

  async remove(login: string): Promise<void> {
    const query: string = `DELETE FROM banlist WHERE login=$1;`
    await this.query(query, login)
  }

  private constructBanObject(entry: TableEntry): tm.BanlistEntry {
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
