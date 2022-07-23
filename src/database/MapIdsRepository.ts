import { Repository } from "./Repository.js";

const createQuery = `CREATE TABLE IF NOT EXISTS map_ids(
  id INT4 GENERATED ALWAYS AS IDENTITY,
  uid VARCHAR(27) UNIQUE,
  PRIMARY KEY(id)
);`

export class MapIdsRepository extends Repository {

  async initialize() {
    await super.initialize(createQuery)
  }

  async add(...mapUids: string[]): Promise<void> {
    this.query(`INSERT INTO map_ids(uid) ${this.getInsertValuesString(1, mapUids.length)}`, ...mapUids)
  }

  async getId(mapUid: string): Promise<string>

  async getId(mapUids: string[]): Promise<string[]>

  async getId(mapUids: string[] | string): Promise<string[] | string> {
    let isArr = true
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
      isArr = false
    }
    const query = `SELECT id FROM map_ids WHERE ${mapUids.map((a, i) => `uid=$${i + 1} OR`).join('').slice(0, -3)}`
    const res = await this.query(query, ...mapUids)
    return isArr ? res.map(a => a.id) : res.map(a => a.id)[0]
  }

  async addAndGetId(mapUid: string): Promise<string>

  async addAndGetId(mapUids: string[]): Promise<string[]>

  async addAndGetId(mapUids: string[] | string): Promise<string[] | string> {
    let isArr = true
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
      isArr = false
    }
    const query = `INSERT INTO map_ids(uid) ${this.getInsertValuesString(1, mapUids.length)} 
    ON CONFLICT (uid) DO UPDATE SET uid=EXCLUDED.uid
    RETURNING id`
    const res = (await this.query(query, ...mapUids)).map(a => a.id)
    return isArr === true ? res : res[0]
  }

}