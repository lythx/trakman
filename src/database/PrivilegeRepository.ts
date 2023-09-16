import { Repository } from "./Repository.js"

interface TableEntry {
  readonly login: string
  readonly privilege: number
}
export class PrivilegeRepository extends Repository {

  async get(login: string): Promise<number>
  async get(logins: string[]): Promise<{ login: string, privilege: number }[]>
  async get(logins: string[] | string): Promise<{ login: string, privilege: number }[] | number> {
    let isArr: boolean = true
    if (typeof logins === 'string') {
      logins = [logins]
      isArr = false
    } else if (logins.length === 0) { return [] }
    const query = `SELECT login, privilege FROM privileges WHERE ${logins.map((a, i) => `login=$${i + 1} OR `).join('').slice(0, -3)}`
    const res = await this.query(query, ...logins)
    return isArr ? res : res[0]?.privilege ?? 0
  }

  async getOperators(): Promise<tm.PrivilegeEntry[]> {
    const query = `select login, privilege from privileges where privilege=1`
    const res = await this.query(query)
    return res.map(a => this.constructPrivilegeObject(a))
  }

  async getAdmins(): Promise<tm.PrivilegeEntry[]> {
    const query = `select login, privilege from privileges where privilege=2`
    const res = await this.query(query)
    return res.map(a => this.constructPrivilegeObject(a))
  }

  async getMasteradmins(): Promise<tm.PrivilegeEntry[]> {
    const query = `select login, privilege from privileges where privilege>2`
    const res = await this.query(query)
    return res.map(a => this.constructPrivilegeObject(a))
  }

  async set(login: string, privilege: number): Promise<void> {
    if (privilege === 0) {
      const query = `DELETE FROM privileges WHERE login=$1`
      await this.query(query, login)
      return
    }
    const query = `INSERT INTO privileges(login, privilege) VALUES($1, $2)
    ON CONFLICT (login) DO UPDATE SET privilege=EXCLUDED.privilege`
    await this.query(query, login, privilege)
  }

  async getOwner(): Promise<string | undefined> {
    const query = `SELECT login FROM privileges WHERE privilege=4`
    const res = await this.query(query)
    return res[0]?.login
  }

  async removeOwner(): Promise<void> {
    const query = 'DELETE FROM privileges WHERE privilege=4'
    await this.query(query)
  }

  private constructPrivilegeObject(entry: TableEntry): tm.PrivilegeEntry {
    return {
      login: entry.login,
      privilege: entry.privilege,
    }
  }

}
