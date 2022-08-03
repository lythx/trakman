import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'
import { PlayerIdsRepository } from './PlayerIdsRepository.js'

const createQuery: string = `
  CREATE TABLE IF NOT EXISTS records(
      map_id INT4 NOT NULL,
      player_id INT4 NOT NULL,
      time INT4 NOT NULL,
      checkpoints INT4[] NOT NULL,
      date TIMESTAMP NOT NULL,
      PRIMARY KEY(map_id, player_id),
      CONSTRAINT fk_player_id
        FOREIGN KEY(player_id) 
	        REFERENCES player_ids(id),
      CONSTRAINT fk_map_id
        FOREIGN KEY(map_id)
          REFERENCES map_ids(id)
  );`

const mapIdsRepo = new MapIdsRepository()
const playerIdsRepo = new PlayerIdsRepository()

interface TableEntry {
  readonly uid: string
  readonly login: string
  readonly time: number
  readonly checkpoints: number[]
  readonly date: Date
}

export class RecordRepository extends Repository {

  async initialize(): Promise<void> {
    await mapIdsRepo.initialize()
    await playerIdsRepo.initialize()
    await super.initialize(createQuery)
  }

  async add(...records: RecordInfo[]): Promise<void> {
    if (records.length === 0) { return }
    const query = `INSERT INTO records(map_id, player_id, time, checkpoints, date) 
    ${this.getInsertValuesString(5, records.length)}`
    const mapIds = await mapIdsRepo.get(records.map(a => a.map))
    const playerIds = await playerIdsRepo.get(records.map(a => a.login))
    const values: any[] = []
    for (const [i, record] of records.entries()) {
      values.push(mapIds[i].id, playerIds[i].id, record.time, record.checkpoints, record.date)
    }
    await this.query(query, ...values)
  }

  async get(...mapUids: string[]): Promise<TMRecord[]> {
    if (mapUids.length === 0) { return [] }
    const query = `SELECT uid, login, time, checkpoints, date FROM records
    JOIN player_ids ON player_ids.id=records.player_id
    JOIN map_ids ON map_ids.id=records.map_id
    WHERE ${mapUids.map((a, i) => `map_id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date DESC;`
    const mapIds = await mapIdsRepo.get(mapUids)
    const res = (await this.query(query, ...mapIds.map(a => a.id)))
    return res.map(a => this.constructRecordObject(a))
  }

  async getByLogin(...logins: string[]): Promise<TMRecord[]> {
    if (logins.length === 0) { return [] }
    const query = `SELECT uid, login, time, checkpoints, date FROM records
    JOIN player_ids ON player_ids.id=records.player_id
    JOIN map_ids ON map_ids.id=records.map_id
    WHERE ${logins.map((a, i) => `player_id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date DESC;`
    const playerIds = await playerIdsRepo.get(logins)
    const res = (await this.query(query, ...playerIds.map(a => a.id)))
    console.log(res, 'res')
    return res.map(a => this.constructRecordObject(a))
  }


  async getOne(mapUid: string, login: string): Promise<TMRecord | undefined> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerIdsRepo.get(login)
    const query: string = `SELECT uid, login, time, checkpoints, date FROM records 
    WHERE map_id=$1 AND player_id=$2`
    const res = (await this.query(query, mapId, playerId))
    return this.constructRecordObject(res[0])
  }

  async remove(mapUid: string, login: string): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerIdsRepo.get(login)
    const query: string = `DELETE FROM records WHERE map_id=$1 AND player_id=$2;`
    await this.query(query, mapId, playerId)
  }

  async removeAll(mapUid: string): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    const query: string = `DELETE FROM records WHERE map_id=$1;`
    await this.query(query, mapId)
  }

  async update(mapUid: string, login: string, time: number, checkpoints: number[], date: Date): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerIdsRepo.get(login)
    const query = 'UPDATE records SET time=$1, checkpoints=$2, date=$3 WHERE map_id=$4 AND player_id=$5'
    await this.query(query, time, checkpoints, date, mapId, playerId)
  }

  async countRecords(login: string): Promise<number> {
    const playerId = await playerIdsRepo.get(login)
    const query = `select count(*) from records where login=$1;`
    return (await this.query(query, playerId))[0].count
  }

  private constructRecordObject(entry: TableEntry): TMRecord {
    return {
      map: entry.uid,
      login: entry.login,
      time: entry.time,
      date: entry.date,
      checkpoints: entry.checkpoints
    }
  }

}
