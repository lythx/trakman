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

  async add(...mapUids: string[]) {
    this.query(`INSERT INTO map_ids(uid) ${this.getInsertValuesString(1, mapUids.length)}`, ...mapUids)
  }

  async getUids(...mapIds: string[]) {
    return await this.query(`SELECT uid FROM map_ids WHERE ${mapIds.map((a, i) => `id=$${i + 1} OR`).slice(0, -3)}`, ...mapIds)
  }

  async getIds(...mapUids: string[]) {
    return await this.query(`SELECT id FROM map_ids WHERE ${mapUids.map((a, i) => `uid=$${i + 1} OR`).slice(0, -3)}`, ...mapUids)
  }

  async addAndGetId(...mapUids: string[]): Promise<string[]> {
    const query = `INSERT INTO map_ids(uid) ${this.getInsertValuesString(1, mapUids.length)} 
    ON CONFLICT (uid) DO UPDATE SET uid=EXCLUDED.uid
    RETURNING id`
    const a= (await this.query(query, ...mapUids)).map(a => a.id)
    console.log(a)
    return a
  }

}