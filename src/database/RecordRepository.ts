import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { Utils } from '../Utils.js'
import { Logger } from '../Logger.js'

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

  async add(...records: RecordInfo[]): Promise<void> {
    const mapIds = await mapIdsRepo.get(records.map(a => a.map))
    const playerIds = await playerRepo.getId(records.map(a => a.login))
    const arr = records.filter(a => mapIds.some(b => b.uid === a.map) && playerIds.some(b => b.login === a.login))
    if (arr.length !== records.length) {
      Logger.error(`Failed to get ids for maps or players ${records
        .filter(a => !(mapIds.some(b => b.uid === a.map)
          && playerIds.some(b => b.login === a.login)))
          .map(a => `(${a.login}, ${a.map})`).join(', ')} while inserting into records table`)
    }
    if (arr.length === 0) { return }
    const query = `INSERT INTO records(map_id, player_id, time, checkpoints, date) 
    ${this.getInsertValuesString(5, arr.length)}`
    const values: any[] = []
    for (const [i, record] of arr.entries()) {
      values.push(mapIds[i].id, playerIds[i].id, record.time, record.checkpoints, record.date)
    }
    await this.query(query, ...values)
  }

  async getAll(): Promise<tm.Record[]> {
    const query = `SELECT uid, login, time, checkpoints, date, nickname FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    ORDER BY uid ASC,
    time ASC,
    date ASC;`
    const res = (await this.query(query))
    return res.map(a => this.constructRecordObject(a))
  }

  async get(...mapUids: string[]): Promise<tm.Record[]> {
    const mapIds = await mapIdsRepo.get(mapUids)
    if (mapIds.length === 0) { return [] }
    const query = `SELECT uid, login, time, checkpoints, date, nickname FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    WHERE ${mapIds.map((a, i) => `map_id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date ASC;`
    const res = (await this.query(query, ...mapIds.map(a => a.id)))
    return res.map(a => this.constructRecordObject(a))
  }

  async getLocalRecords(...mapUids: string[]): Promise<tm.LocalRecord[]> {
    const mapIds = await mapIdsRepo.get(mapUids)
    if (mapIds.length === 0) { return [] }
    const query = `SELECT uid, players.login, time, checkpoints, date, nickname, region, wins, time_played, 
    visits, is_united, last_online, average, privilege FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    LEFT JOIN privileges ON privileges.login=players.login
    WHERE ${mapIds.map((a, i) => `map_id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date ASC;`
    const res = (await this.query(query, ...mapIds.map(a => a.id)))
    return res.map(a => this.constuctLocalRecord(a))
  }

  async getByLogin(...logins: string[]): Promise<tm.Record[]> {
    const playerIds = await mapIdsRepo.get(logins)
    if (playerIds.length === 0) { return [] }
    const query = `SELECT uid, login, time, checkpoints, date, nickname FROM records
    JOIN map_ids ON map_ids.id=records.map_id
    JOIN players ON players.id=records.player_id
    WHERE ${playerIds.map((a, i) => `players.id=$${i + 1} OR `).join(' ').slice(0, -3)}
    ORDER BY time ASC,
    date ASC;`
    const res = (await this.query(query, ...playerIds.map(a => a.id)))
    return res.map(a => this.constructRecordObject(a))
  }


  async getOne(mapUid: string, login: string): Promise<tm.Record | undefined> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
    if (mapId === undefined || playerId === undefined) { return }
    const query: string = `SELECT time, checkpoints, date FROM records 
    WHERE map_id=$1 AND player_id=$2`
    const res = (await this.query(query, mapId, playerId))
    return this.constructRecordObject({ uid: mapUid, login, ...res[0] })
  }

  async remove(mapUid: string, login: string): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
    if (mapId === undefined || playerId === undefined) {
      Logger.error(`Failed to get mapId or playerId (${mapUid},${login}) while removing from records table`)
      return
    }
    const query: string = `DELETE FROM records WHERE map_id=$1 AND player_id=$2;`
    await this.query(query, mapId, playerId)
  }

  async removeAll(mapUid: string): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    if (mapId === undefined) {
      Logger.error(`Failed to get id for map ${mapUid} while removing from records table`)
      return
    }
    const query: string = `DELETE FROM records WHERE map_id=$1;`
    await this.query(query, mapId)
  }

  async update(mapUid: string, login: string, time: number, checkpoints: number[], date: Date): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
    if (mapId === undefined || playerId === undefined) {
      Logger.error(`Failed to get mapId or playerId (${login},${mapUid}) while updating records table`)
      return
    }
    const query = 'UPDATE records SET time=$1, checkpoints=$2, date=$3 WHERE map_id=$4 AND player_id=$5'
    await this.query(query, time, checkpoints, date, mapId, playerId)
  }

  async countRecords(login: string): Promise<number> {
    const playerId = await playerRepo.getId(login)
    if (playerId === undefined) { return 0 }
    const query = `SELECT COUNT(*)::int from RECORDS where player_id=$1;`
    return (await this.query(query, playerId))[0].count
  }

  private constructRecordObject(entry: TableEntry): tm.Record {
    return {
      map: entry.uid,
      login: entry.login,
      time: entry.time,
      date: entry.date,
      checkpoints: entry.checkpoints,
      nickname: entry.nickname
    }
  }

  private constuctLocalRecord(entry: TableEntryWithPlayerInfo): tm.LocalRecord {
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
