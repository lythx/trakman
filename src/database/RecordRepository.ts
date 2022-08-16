import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { Utils } from '../Utils.js'

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
	        REFERENCES players(id),
      CONSTRAINT fk_map_id
        FOREIGN KEY(map_id)
          REFERENCES map_ids(id)
  );`

const mapIdsRepo = new MapIdsRepository()
const playerRepo = new PlayerRepository()

interface TableEntry {
  readonly uid: string
  readonly login: string
  readonly time: number
  readonly checkpoints: number[]
  readonly date: Date
  readonly nickname: string
}

type TableEntryWithPlayerInfo = TableEntry & {
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

export class RecordRepository extends Repository {

  async initialize(): Promise<void> {
    await mapIdsRepo.initialize()
    await playerRepo.initialize()
    await super.initialize(createQuery)
  }

  async add(...records: RecordInfo[]): Promise<void> {
    if (records.length === 0) { return }
    const query = `INSERT INTO records(map_id, player_id, time, checkpoints, date) 
    ${this.getInsertValuesString(5, records.length)}`
    const mapIds = await mapIdsRepo.get(records.map(a => a.map))
    const playerIds = await playerRepo.getId(records.map(a => a.login))
    const values: any[] = []
    for (const [i, record] of records.entries()) {
      values.push(mapIds[i].id, playerIds[i].id, record.time, record.checkpoints, record.date)
    }
    await this.query(query, ...values)
  }

  async getAll(): Promise<TMRecord[]> {
    const query = `SELECT uid, login, time, checkpoints, date, nickname FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    ORDER BY uid ASC,
    time ASC,
    date ASC;`
    const res = (await this.query(query))
    return res.map(a => this.constructRecordObject(a))
  }

  async get(...mapUids: string[]): Promise<TMRecord[]> {
    if (mapUids.length === 0) { return [] }
    const query = `SELECT uid, login, time, checkpoints, date, nickname FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    WHERE ${mapUids.map((a, i) => `map_id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date ASC;`
    const mapIds = await mapIdsRepo.get(mapUids)
    const res = (await this.query(query, ...mapIds.map(a => a.id)))
    return res.map(a => this.constructRecordObject(a))
  }

  async getLocalRecords(...mapUids: string[]): Promise<TMLocalRecord[]> {
    if (mapUids.length === 0) { return [] }
    const query = `SELECT uid, players.login, time, checkpoints, date, nickname, region, wins, time_played, 
    visits, is_united, last_online, average, privilege FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    LEFT JOIN privileges ON privileges.login=players.login
    WHERE ${mapUids.map((a, i) => `map_id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date ASC;`
    const mapIds = await mapIdsRepo.get(mapUids)
    const res = (await this.query(query, ...mapIds.map(a => a.id)))
    return res.map(a => this.constuctLocalRecord(a))
  }

  async getByLogin(...logins: string[]): Promise<TMRecord[]> {
    if (logins.length === 0) { return [] }
    const query = `SELECT uid, login, time, checkpoints, date, nickname FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    WHERE ${logins.map((a, i) => `players.id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date ASC;`
    const playerIds = await playerRepo.getId(logins)
    const res = (await this.query(query, ...playerIds.map(a => a.id)))
    return res.map(a => this.constructRecordObject(a))
  }


  async getOne(mapUid: string, login: string): Promise<TMRecord | undefined> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
    const query: string = `SELECT time, checkpoints, date FROM records 
    WHERE map_id=$1 AND player_id=$2`
    const res = (await this.query(query, mapId, playerId))
    return this.constructRecordObject({ uid: mapUid, login, ...res[0] })
  }

  async remove(mapUid: string, login: string): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
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
    const playerId = await playerRepo.getId(login)
    const query = 'UPDATE records SET time=$1, checkpoints=$2, date=$3 WHERE map_id=$4 AND player_id=$5'
    await this.query(query, time, checkpoints, date, mapId, playerId)
  }

  async countRecords(login: string): Promise<number> {
    const playerId = await playerRepo.getId(login)
    const query = `SELECT COUNT(*)::int from RECORDS where player_id=$1;`
    return (await this.query(query, playerId))[0].count
  }

  private constructRecordObject(entry: TableEntry): TMRecord {
    return {
      map: entry.uid,
      login: entry.login,
      time: entry.time,
      date: entry.date,
      checkpoints: entry.checkpoints,
      nickname: entry.nickname
    }
  }

  private constuctLocalRecord(entry: TableEntryWithPlayerInfo): TMLocalRecord {
    const country: string = entry.region.split('|')[0]
    return {
      map: entry.uid,
      login: entry.login,
      time: entry.time,
      date: entry.date,
      checkpoints: entry.checkpoints,
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
