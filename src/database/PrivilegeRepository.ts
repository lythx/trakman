import { Repository } from "./Repository.js";
import { PlayerIdsRepository } from './PlayerIdsRepository.js'

const createQuery = `CREATE TABLE IF NOT EXISTS privileges(
    player_id INT4 NOT NULL,
    privilege INT2 NOT NULL,
    PRIMARY KEY(player_id),
    CONSTRAINT fk_player_id
      FOREIGN KEY(player_id) 
	      REFERENCES player_ids(id)
);`

const playerIdsRepo = new PlayerIdsRepository()

export class PrivilegeRepository extends Repository {

  async initialize() {
    await playerIdsRepo.initialize()
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
    const ids = await playerIdsRepo.get(logins)
    const loginIds: { login: string, id: number }[] = []
    const query = `SELECT id, privilege FROM privileges WHERE ${logins.map((a, i) => `player_id=$${i + 1} OR`).join('').slice(0, -3)}`
    const res = await this.query(query, ...ids.map(a => a.id))
    return isArr === false ? res[0]?.privilege ?? 0 :
      res.map((a, i) => ({ privilege: a.privilege, login: loginIds.find(a => a.id === res[i].id)?.login }))
  }

  async set(login: string, privilege: number): Promise<void> {
    const id = await playerIdsRepo.get(login)
    if (privilege === 0) {
      const query = `DELETE FROM privileges WHERE id=$1`
      await this.query(query, id)
      return
    }
    const query = `INSERT INTO privileges id, privilege VALUES($1, $2)
    ON CONFLICT (id) DO UPDATE SET privilege=EXCLUDED.privilege`
    await this.query(query, id, privilege)
  }

  async getOwner(): Promise<string | undefined> {
    const query = `SELECT login FROM privileges WHERE privilege=4`
    const res = await this.db.query(query)
    return res.rows[0]?.login
  }

  async removeOwner(): Promise<void> {
    const query = 'UPDATE privileges SET privilege=0 WHERE privilege=4'
    await this.db.query(query)
  }

}