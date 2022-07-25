import { Repository } from "./Repository.js";

const createQuery = `CREATE TABLE IF NOT EXISTS privileges(
    login VARCHAR(25) NOT NULL,
    privilege INT2 NOT NULL,
    PRIMARY KEY(login)
);`

export class PrivilegeRepository extends Repository {

  async initialize() {
    await super.initialize(createQuery)
  }

  async get(login: string): Promise<number>
  async get(logins: string[]): Promise<{ login: string, privilege: number }[]>
  async get(logins: string[] | string): Promise<{ login: string, privilege: number }[] | number> {
    let isArr = true
    if (typeof logins === 'string') {
      logins = [logins]
      isArr = false
    } else if (logins.length === 0) { return [] }
    const query = `SELECT login, privilege FROM privileges WHERE ${logins.map((a, i) => `login=$${i + 1} OR`).join('').slice(0, -3)}`
    const res = await this.query(query, ...logins)
    return isArr === false ? res[0]?.privilege ?? 0 : res
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
    const res = await this.db.query(query)
    return res.rows[0]?.login
  }

  async removeOwner(): Promise<void> {
    const query = 'DELETE FROM privileges WHERE privilege=4'
    await this.db.query(query)
  }

}