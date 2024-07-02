import {Repository} from "./Repository.js"
import config from "../../config/Config.js"

export class MapIdsRepository extends Repository {

  /**
   * Fetches map database id
   * @param mapUid Map uid
   * @returns Map id or undefined if map is not in database
   */
  async get(mapUid: string): Promise<number | undefined>
  /**
   * Fetches multiple map database ids
   * @param mapUids Array of map uids
   * @returns Array of objects containing map id and uid. If map is not in the database it won't be in the array
   */
  async get(mapUids: string[]): Promise<{ uid: string, id: number }[]>
  async get(mapUids: string[] | string): Promise<{ uid: string, id: number }[] | number | undefined> {
    let isArr = true
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
      isArr = false
    } else if (mapUids.length === 0) {
      return []
    }
    const query = `SELECT uid, id
                   FROM map_ids
                   WHERE ${mapUids.map((a, i) => `uid=$${i + 1} OR `).join('').slice(0, -3)}`
    const res = await this.query(query, ...mapUids)
    return isArr ? res : res[0]?.id
  }

  /**
   * Get map id's one chunk at a time to prevent overly long queries that cause crashes.
   * @param mapUids one or more map uid's.
   */
  async splitGet(mapUids: string[] | string) {
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
    } else if (mapUids.length === 0) {
      return []
    }
    const splitby = config.splitBy
    const len = Math.ceil(mapUids.length / splitby)
    const ret = []
    for (let i = 0; i < len; i++) {
      ret.push(...await this.get(mapUids.slice(i * splitby, (i + 1) * splitby)))
    }
    return ret
  }

  async addAndGet(mapUid: string): Promise<number>
  async addAndGet(mapUids: string[]): Promise<{ uid: string, id: number }[]>
  async addAndGet(mapUids: string[] | string): Promise<{ uid: string, id: number }[] | number> {
    let isArr = true
    if (typeof mapUids === 'string') {
      mapUids = [mapUids]
      isArr = false
    } else if (mapUids.length === 0) {
      return []
    }
    const uidSet = new Set(mapUids)
    const query = `INSERT INTO map_ids(uid) ${this.getInsertValuesString(1, uidSet.size)} ON CONFLICT (uid) DO
    UPDATE SET uid=EXCLUDED.uid
        RETURNING id, uid`
    const res = (await this.query(query, ...uidSet))
    return isArr ? res : res[0]?.id
  }

}