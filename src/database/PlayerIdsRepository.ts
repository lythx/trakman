import { Repository } from "./Repository.js";

const createQuery = `CREATE TABLE IF NOT EXISTS player_ids(
  id INT4 GENERATED ALWAYS AS IDENTITY,
  login VARCHAR(25) NOT NULL UNIQUE,
  PRIMARY KEY(id)
);`

export class PlayerIdsRepository extends Repository {

  async initialize() {
    await super.initialize(createQuery)
  }

  readonly cachedIds: { login: string, id: number }[] = []

  async get(login: string): Promise<number | undefined>
  async get(logins: string[]): Promise<{ login: string, id: number }[]>
  async get(logins: string[] | string): Promise<{ login: string, id: number }[] | number | undefined> {
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
    const query = `SELECT id, login FROM player_ids WHERE ${logins.map((a, i) => `login=$${i + 1} OR `).join('').slice(0, -3)}`
    const res = await this.query(query, ...logins)
    this.cachedIds.push(...res)
    this.cachedIds.length = Math.min(this.cachedIds.length, 300)
    return isArr === true ? ret.concat(res) : res[0]?.id
  }

  async addAndGet(login: string): Promise<number>
  async addAndGet(logins: string[]): Promise<{ login: string, id: number }[]>
  async addAndGet(logins: string[] | string): Promise<{ login: string, id: number }[] | number> {
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
      }))
      if (logins.length === 0) { return ret }
    }
    const query = `INSERT INTO player_ids(login) ${this.getInsertValuesString(1, logins.length)} 
    ON CONFLICT (login) DO UPDATE SET login=EXCLUDED.login
    RETURNING id, login`
    const res = (await this.query(query, ...logins))
    this.cachedIds.push(...res)
    this.cachedIds.length = Math.min(this.cachedIds.length, 300)
    return isArr === true ? ret.concat(res) : res[0]?.id
  }

}