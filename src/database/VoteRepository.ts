import { Repository } from './Repository.js'
import { PlayerIdsRepository } from './PlayerIdsRepository.js'
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
        REFERENCES player_ids(id),
    CONSTRAINT fk_map_id
      FOREIGN KEY(map_id)
        REFERENCES map_ids(id)
);`

interface TableEntry {
  readonly uid: string
  readonly login: string
  readonly vote: -3 | -2 | -1 | 1 | 2 | 3
  readonly date: Date
}

const mapIdsRepo = new MapIdsRepository()
const playerIdsRepo = new PlayerIdsRepository()

export class VoteRepository extends Repository {

  async initialize(): Promise<void> {
    await mapIdsRepo.initialize()
    await playerIdsRepo.initialize()
    await super.initialize(createQuery)
  }

  async add(...votes: TMVote[]): Promise<void> {
    if (votes.length === 0) { return }
    const query = `INSERT INTO votes(map_id, player_id, vote, date) 
    ${this.getInsertValuesString(4, votes.length)}`
    const mapIds = await mapIdsRepo.get(votes.map(a => a.mapId))
    const playerIds = await playerIdsRepo.get(votes.map(a => a.login))
    const values: any[] = []
    for (const [i, vote] of votes.entries()) {
      values.push(mapIds[i].id, playerIds[i].id, vote.vote, vote.date)
    }
    await this.query(query, ...values)
  }

  async update(mapUid: string, login: string, vote: number, date: Date): Promise<void> {
    const query: string = 'UPDATE votes SET vote=$1, date=$2 WHERE map_id=$3 AND player_id=$4;'
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerIdsRepo.addAndGet(login)
    await this.query(query, vote, date, mapId, playerId)
  }

  async getOne(mapUid: string, login: string): Promise<TMVote | undefined> {
    const query: string = `SELECT login, vote, date FROM votes 
    JOIN player_ids ON player_ids.id=votes.player_id
    WHERE map_id=$1 AND player_id=$2;`
    const mapId = await mapIdsRepo.get(mapUid)
    const playerId = await playerIdsRepo.get(login)
    const res = await this.query(query, mapId, playerId)
    return res[0] === undefined ? undefined : this.constructVoteObject({ ...res[0], uid: mapUid })
  }

  async get(mapUid: string): Promise<TMVote[]> {
    const query: string = `SELECT login, vote, date FROM votes 
    JOIN player_ids ON player_ids.id=votes.player_id
    WHERE map_id=$1;`
    const mapId = await mapIdsRepo.get(mapUid)
    const res = await this.query(query, mapId)
    return res.map(a => this.constructVoteObject({ ...a, uid: mapUid }))
  }

  async getAll(): Promise<TMVote[]> {
    const query: string = `SELECT uid, login, vote, date FROM votes 
    JOIN map_ids ON map_ids.id=votes.map_id
    JOIN player_ids ON player_ids.id=votes.player_id;`
    const res = await this.query(query)
    return res.map(a => this.constructVoteObject(a))
  }

  constructVoteObject(entry: TableEntry): TMVote {
    return {
      login: entry.login,
      mapId: entry.uid,
      vote: entry.vote,
      date: entry.date
    }
  }

}
