import { Repository } from "./Repository.js";

const createQuery = `CREATE TABLE IF NOT EXISTS map_ids(
  id INT4 GENERATED ALWAYS AS IDENTITY,
  uid VARCHAR(27) NOT NULL UNIQUE,
  PRIMARY KEY(id)
);`

export class MapIdsRepository extends Repository {

  async initialize() {
    await super.initialize(createQuery)
  }

  async get(mapUid: string): Promise<number | undefined>
  async get(mapUids: string[]): Promise<{ uid: string, id: number }[]>
  async get(mapUids: string[] | string): Promise<{ uid: string, id: number }[] | number | undefined> {
    let isArr = true
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
      isArr = false
    } else if (mapUids.length === 0) { return [] }
    const query = `SELECT uid, id FROM map_ids WHERE ${mapUids.map((a, i) => `uid=$${i + 1} OR`).join('').slice(0, -3)}`
    const res = await this.query(query, ...mapUids)
    return isArr ? res : res[0]?.id
  }

  async addAndGet(mapUid: string): Promise<number>
  async addAndGet(mapUids: string[]): Promise<{ uid: string, id: number }[]>
  async addAndGet(mapUids: string[] | string): Promise<{ uid: string, id: number }[] | number> {
    let isArr = true
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
      isArr = false
    } else if (mapUids.length === 0) { return [] }
    const query = `INSERT INTO map_ids(uid) ${this.getInsertValuesString(1, mapUids.length)} 
    ON CONFLICT (uid) DO UPDATE SET uid=EXCLUDED.uid
    RETURNING id, uid`
    const res = (await this.query(query, ...mapUids))
    return isArr === true ? res : res[0]?.id
  }

}