import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { MapIdsRepository } from './MapIdsRepository.js'

const createQuery: string = `
CREATE TABLE IF NOT EXISTS votes(
    map_id INT4 NOT NULL,
    player_id INT4 NOT NULL,
    vote INT2 NOT NULL,
    date TIMESTAMP NOT NULL,
    PRIMARY KEY(map_id, player_id),
    CONSTRAINT fk_player_id
      FOREIGN KEY(player_id) 
        REFERENCES players(id),
    CONSTRAINT fk_map_id
      FOREIGN KEY(map_id)
        REFERENCES map_ids(id)
);`
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

  async initialize(): Promise<void> {
    await mapIdsRepo.initialize()
    await playerRepo.initialize()
    await super.initialize(createQuery)
  }

  async add(...votes: tm.Vote[]): Promise<void> {
    if (votes.length === 0) { return }
    const query = `INSERT INTO votes(map_id, player_id, vote, date) 
    ${this.getInsertValuesString(4, votes.length)}`
    const mapIds = await mapIdsRepo.get(votes.map(a => a.mapId))
    const playerIds = await playerRepo.getId(votes.map(a => a.login))
    const values: any[] = []
    for (const [i, vote] of votes.entries()) {
      const parsedVote = Number(Object.entries(tableVotes).find(a => a[1] === vote.vote)?.[0])
      values.push(mapIds[i].id, playerIds[i].id, parsedVote, vote.date)
    }
    await this.query(query, ...values)
  }

  async update(mapUid: string, login: string, vote: number, date: Date): Promise<void> {
    const query: string = 'UPDATE votes SET vote=$1, date=$2 WHERE map_id=$3 AND player_id=$4;'
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerRepo.getId(login)
    const parsedVote = Number(Object.entries(tableVotes).find(a => a[1] === vote)?.[0])
    await this.query(query, parsedVote, date, mapId, playerId)
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
    const query: string = `SELECT uid, login, vote, date FROM votes 
    JOIN players ON players.id=votes.player_id
    JOIN map_ids ON map_ids.id=votes.map_id
    WHERE ${mapUids.map((a, i) => `votes.map_id=$${i + 1} OR `).join('').slice(0, -3)}`
    const ids = await mapIdsRepo.get(mapUids)
    if (ids.length === 0) { return [] }
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
