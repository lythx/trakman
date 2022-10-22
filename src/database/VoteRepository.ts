import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { MapIdsRepository } from './MapIdsRepository.js'
import { Logger } from '../Logger.js'

interface TableEntry {
  readonly uid: string
  readonly login: string
  readonly vote: 0 | 20 | 40 | 60 | 80 | 100
  readonly date: Date
}

const mapIdsRepo = new MapIdsRepository()
const playerRepo = new PlayerRepository()
const tableVotes = {
  0: -3,
  20: -2,
  40: -1,
  60: 1,
  80: 2,
  100: 3
} as const

export class VoteRepository extends Repository {

  async add(...votes: tm.Vote[]): Promise<void> {
    const mapIds = await mapIdsRepo.get(votes.map(a => a.mapId))
    const playerIds = await playerRepo.getId(votes.map(a => a.login))
    const arr = votes.filter(a => mapIds.some(b => b.uid === a.mapId) && playerIds.some(b => b.login === a.login))
    if (arr.length !== votes.length) {
      Logger.error(`Failed to get ids for maps or players ${votes
        .filter(a => !(mapIds.some(b => b.uid === a.mapId)
          && playerIds.some(b => b.login === a.login)))
        .map(a => `(${a.login}, ${a.mapId})`).join(', ')} while inserting into votes table`)
    }
    if (arr.length === 0) { return }
    const query = `INSERT INTO votes(map_id, player_id, vote, date) 
    ${this.getInsertValuesString(4, arr.length)}`
    const values: any[] = []
    for (const [i, vote] of arr.entries()) {
      const parsedVote = Number(Object.entries(tableVotes).find(a => a[1] === vote.vote)?.[0])
      values.push(mapIds[i].id, playerIds[i].id, parsedVote, vote.date)
    }
    await this.query(query, ...values)
  }

  async update(mapUid: string, objects: { login: string, vote: number, date: Date }[]): Promise<void>
  async update(mapUid: string, login: string, vote: number, date: Date): Promise<void>
  async update(mapUid: string,
    arg: string | { login: string, vote: number, date: Date }[], vote?: number, date?: Date): Promise<void> {
    const mapId = await mapIdsRepo.get(mapUid)
    if (typeof arg === 'string') {
      const login = arg
      const query: string = 'UPDATE votes SET vote=$1, date=$2 WHERE map_id=$3 AND player_id=$4;'
      const playerId = await playerRepo.getId(login ?? '')
      if (mapId === undefined || playerId === undefined) {
        Logger.error(`Failed to get mapId or playerId (${login},${mapUid}) while updating votes table`)
        return
      }
      const parsedVote = Number(Object.entries(tableVotes).find(a => a[1] === vote)?.[0])
      await this.query(query, parsedVote, date, mapId, playerId)
      return
    }
    const playerIds = await playerRepo.getId(arg.map(a => a.login))
    const arr = arg.filter(a => playerIds.some(b => b.login === a.login))
    if (arr.length !== arg.length) {
      Logger.error(`Failed to get ids for players ${arg.filter(a => !playerIds.some(b => b.login === a.login))
        .map(a => `${a.login}`).join(', ')} while inserting into votes table`)
    }
    const query: string = `UPDATE votes SET 
    vote=v.vote, date=v.date
    FROM (VALUES
    ${arr.map(a => `(${a.vote}, ${a.date}, ${mapId}, ${playerIds.find(a => a.login)?.id}),`).join('').slice(0, -1)}
    ) AS v(vote, date, map_id, player_id)
    WHERE v.map_id=votes.map_id AND v.player_id=votes.player_id;`
    await this.query(query)
  }

  async getOne(mapUid: string, login: string): Promise<tm.Vote | undefined> {
    const query: string = `SELECT login, vote, date FROM votes 
    JOIN players ON players.id=votes.player_id
    WHERE map_id=$1 AND player_id=$2;`
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
    const res = await this.query(query, mapId, playerId)
    return res[0] === undefined ? undefined : this.constructVoteObject({ ...res[0], uid: mapUid })
  }

  async get(...mapUids: string[]): Promise<tm.Vote[]> {
    const ids = await mapIdsRepo.get(mapUids)
    if (ids.length === 0) { return [] }
    const query: string = `SELECT uid, login, vote, date FROM votes 
    JOIN players ON players.id=votes.player_id
    JOIN map_ids ON map_ids.id=votes.map_id
    WHERE ${ids.map((a, i) => `votes.map_id=$${i + 1} OR `).join('').slice(0, -3)}`
    const res = await this.query(query, ...ids.map(a => a.id))
    return res.map(a => this.constructVoteObject(a))
  }

  async getAll(): Promise<tm.Vote[]> {
    const query: string = `SELECT uid, login, vote, date FROM votes 
    JOIN map_ids ON map_ids.id=votes.map_id
    JOIN players ON players.id=votes.player_id;`
    const res = await this.query(query)
    return res.map(a => this.constructVoteObject(a))
  }

  constructVoteObject(entry: TableEntry): tm.Vote {
    return {
      login: entry.login,
      mapId: entry.uid,
      vote: tableVotes[entry.vote],
      date: entry.date
    }
  }

}
