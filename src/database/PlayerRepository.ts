import { Repository } from './Repository.js'
import { Utils } from '../Utils.js'

const createQuery: string = `
  CREATE TABLE IF NOT EXISTS players(
    id INT4 GENERATED ALWAYS AS IDENTITY,
    login VARCHAR(40) NOT NULL UNIQUE,
    nickname VARCHAR(45) NOT NULL,
    region VARCHAR(58) NOT NULL,
    wins INT4 NOT NULL,
    time_played INT4 NOT NULL,
    visits INT4 NOT NULL,
    is_united BOOLEAN NOT NULL,
    average REAL NOT NULL,
    last_online TIMESTAMP,
    PRIMARY KEY(id)
  );`

interface TableEntry {
  readonly login: string
  readonly nickname: string
  readonly region: string
  readonly wins: number
  readonly time_played: number
  readonly visits: number
  readonly is_united: boolean
  readonly privilege?: number
  readonly last_online: Date | null
  readonly average: number
}

export class PlayerRepository extends Repository {

  readonly cachedIds: { login: string, id: number }[] = []

  async initialize(): Promise<void> {
    await super.initialize(createQuery)
  }

  async get(login: string): Promise<TM.OfflinePlayer | undefined>
  async get(logins: string[]): Promise<TM.OfflinePlayer[]>
  async get(logins: string | string[]): Promise<TM.OfflinePlayer | TM.OfflinePlayer[] | undefined> {
    if (typeof logins === 'string') {
      const query: string = `SELECT players.login, nickname, region, wins, time_played, visits, is_united, last_online, average, privilege FROM players 
      LEFT JOIN privileges ON players.login=privileges.login
      WHERE players.login=$1`
      const res = await this.query(query, logins)
      return res[0] === undefined ? undefined : this.constructPlayerObject(res[0])
    }
    if (logins.length === 0) { return [] }
    const query: string = `SELECT players.login, nickname, region, wins, time_played, visits, is_united, last_online, average, privilege FROM players 
    LEFT JOIN privileges ON players.login=privileges.login
    WHERE ${logins.map((a, i) => `players.login=$${i + 1} OR `).join('').slice(0, -3)}`
    const res = await this.query(query, ...logins)
    return res.map(a => this.constructPlayerObject(a))
  }

  async add(...players: TM.OfflinePlayer[]): Promise<void> {
    if (players.length === 0) { return }
    const query: string = `INSERT INTO players(login, nickname, region, wins, time_played, visits, is_united, last_online, average) 
    ${this.getInsertValuesString(9, players.length)};`
    const values: any[] = []
    for (const player of players) {
      values.push(player.login, player.nickname, player.region, player.wins, Math.round(player.timePlayed / 1000), player.visits, player.isUnited, player.lastOnline, player.average)
    }
    await this.query(query, ...values)
  }

  async updateAverage(login: string, average: number): Promise<void> {
    const query: string = `UPDATE players SET average=$1 WHERE login=$2;`
    await this.query(query, average, login)
  }

  async updateOnWin(login: string, wins: number): Promise<void> {
    const query: string = `UPDATE players SET wins=$1 WHERE login=$2;`
    await this.query(query, wins, login)
  }

  async updateOnJoin(login: string, nickname: string, region: string, visits: number, isUnited: boolean): Promise<void> {
    const query: string = `UPDATE players SET nickname=$1, region=$2, visits=$3, is_united=$4 WHERE login=$5;`
    await this.query(query, nickname, region, visits, isUnited, login)
  }

  async updateOnLeave(login: string, timePlayed: number, date: Date): Promise<void> {
    const query: string = `UPDATE players SET time_played=$1, last_online=$2 WHERE login=$3;`
    await this.query(query, Math.round(timePlayed / 1000), date, login)
  }

  async getAverage(login: string): Promise<number | undefined>
  async getAverage(logins: string[]): Promise<{ login: string, average: number }[]>
  async getAverage(logins: string | string[]): Promise<number | { login: string, average: number }[] | undefined> {
    if (typeof logins === 'string') {
      const query: string = `SELECT average FROM players
      WHERE players.login=$1`
      const res = await this.query(query, logins)
      return res[0] === undefined ? undefined : res[0].average
    }
    if (logins.length === 0) { return [] }
    const query: string = `SELECT players.login, average FROM players 
    WHERE ${logins.map((a, i) => `players.login=$${i + 1} OR `).join('').slice(0, -3)}
    ORDER BY average ASC`
    const res = await this.query(query, ...logins)
    return res
  }

  async getRanks(): Promise<string[]> {
    const query: string = `SELECT players.login FROM players
    ORDER BY average ASC`
    const res = await this.query(query)
    return res.map(a => a.login)
  }

  async getId(login: string): Promise<number | undefined>
  async getId(logins: string[]): Promise<{ login: string, id: number }[]>
  async getId(logins: string[] | string): Promise<{ login: string, id: number }[] | number | undefined> {
    let isArr = true
    const ret: { login: string, id: number }[] = []
    if (typeof logins === 'string') {
      const cached = this.cachedIds.find(a => a.login === logins)
      if (cached !== undefined) { return cached.id }
      logins = [logins]
      isArr = false
    } else {
      ret.push(...this.cachedIds.filter(a => {
        const isCached = (logins as any).includes(a.login)
        if (isCached === true) { logins = (logins as any).filter((b: string) => b !== a.login) }
        return isCached
      }))
      if (logins.length === 0) { return ret }
    }
    const query = `SELECT id, login FROM players WHERE ${logins.map((a, i) => `login=$${i + 1} OR `).join('').slice(0, -3)}`
    const res = await this.query(query, ...logins)
    this.cachedIds.push(...res)
    this.cachedIds.length = Math.min(this.cachedIds.length, 300)
    return isArr === true ? ret.concat(res) : res[0]?.id
  }

  private constructPlayerObject(entry: TableEntry): TM.OfflinePlayer {
    const country: string = entry.region.split('|')[0]
    return {
      login: entry.login,
      nickname: entry.nickname,
      country: country,
      countryCode: Utils.countryToCode(country) as any,
      region: entry.region,
      timePlayed: entry.time_played * 1000,
      lastOnline: entry.last_online ?? undefined,
      visits: entry.visits,
      isUnited: entry.is_united,
      wins: entry.wins,
      privilege: entry.privilege ?? 0,
      average: entry.average
    }
  }

}
