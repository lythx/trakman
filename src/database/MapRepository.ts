import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'

const createQuery: string = `
CREATE TABLE IF NOT EXISTS maps(
  id INT4 NOT NULL,
  name VARCHAR(60) NOT NULL,
  filename VARCHAR(255) NOT NULL UNIQUE,
  author VARCHAR(40) NOT NULL,
  environment INT2 NOT NULL,
  mood INT2 NOT NULL,
  bronze_time INT4 NOT NULL,
  silver_time INT4 NOT NULL,
  gold_time INT4 NOT NULL,
  author_time INT4 NOT NULL,
  copper_price INT4 NOT NULL,
  is_lap_race BOOLEAN NOT NULL,
  add_date TIMESTAMP NOT NULL,
  leaderboard_rating INT4,
  awards INT2,
  laps_amount INT2,
  checkpoints_amount INT2,
  PRIMARY KEY(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(id) 
	    REFERENCES map_ids(id)
);`

// TODO fix this later probably
const voteCreateQuery = `CREATE TABLE IF NOT EXISTS votes(
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
  readonly name: string
  readonly filename: string
  readonly author: string
  readonly environment: number
  readonly mood: number
  readonly bronze_time: number
  readonly silver_time: number
  readonly gold_time: number
  readonly author_time: number
  readonly copper_price: number
  readonly is_lap_race: boolean
  readonly add_date: Date
  readonly leaderboard_rating: number | null
  readonly awards: number | null
  readonly laps_amount: number | null
  readonly checkpoints_amount: number | null
  readonly vote_count: number
  readonly vote_sum: number
}

const moods = {
  Sunrise: 1,
  Day: 2,
  Sunset: 3,
  Night: 4
}

const environments = {
  Stadium: 1,
  Island: 2,
  Desert: 3,
  Rally: 4,
  Bay: 5,
  Coast: 6,
  Snow: 7
};

const mapIdsRepo = new MapIdsRepository()

export class MapRepository extends Repository {

  async initialize(): Promise<void> {
    await mapIdsRepo.initialize()
    await super.initialize(createQuery)
    // This service joins vote service which gets initialized later therefore table needs to be created here
    await this.query(voteCreateQuery)
  }

  async add(...maps: TM.Map[]): Promise<void> {
    if (maps.length === 0) { return }
    const query = `INSERT INTO maps(id, name, filename, author, environment, mood, 
      bronze_time, silver_time, gold_time, author_time, copper_price, is_lap_race, 
      laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards) ${this.getInsertValuesString(17, maps.length)}`
    const ids = await mapIdsRepo.addAndGet(maps.map(a => a.id))
    const values: any[] = []
    for (const [i, map] of maps.entries()) {
      values.push(ids[i].id, map.name,
        map.fileName, map.author, environments[map.environment], moods[map.mood], map.bronzeTime, map.silverTime,
        map.goldTime, map.authorTime, map.copperPrice, map.isLapRace, map.lapsAmount, map.checkpointsAmount, map.addDate,
        map.leaderboardRating, map.awards)
    }
    await this.query(query, ...values)
  }

  async getAll(): Promise<TM.Map[]> {
    const query = `SELECT uid, name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
    author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards,
    count(votes.map_id)::int AS vote_count, sum(votes.vote) AS vote_sum FROM maps 
    JOIN map_ids ON maps.id=map_ids.id
    LEFT JOIN votes ON votes.map_id=maps.id
    GROUP BY (uid, name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
      author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards);`
    return ((await this.query(query))).map(a => this.constructMapObject(a))
  }

  async get(mapId: string): Promise<TM.Map | undefined>
  async get(mapIds: string[]): Promise<TM.Map[]>
  async get(mapIds: string | string[]): Promise<TM.Map | TM.Map[] | undefined> {
    let isArr = true
    if (typeof mapIds === 'string') {
      isArr = false
      mapIds = [mapIds]
    } else if (mapIds.length === 0) { return [] }
    const query = `SELECT uid, name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
    author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards,
    count(votes.map_id)::int AS vote_count, sum(votes.vote) AS vote_sum FROM maps
    JOIN map_ids ON maps.id=map_ids.id
    LEFT JOIN votes ON votes.map_id=maps.id
    WHERE ${mapIds.map((a, i) => `id=$${i + 1} OR `).join('').slice(0, -3)}
    GROUP BY (uid, name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
      author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards);`
    const ids = await mapIdsRepo.get(mapIds)
    const res = (await this.query(query, ...ids.map(a => a.id)))
    if (isArr === false) {
      return res[0] === undefined ? undefined : this.constructMapObject(res[0])
    }
    return res.map(a => this.constructMapObject(a))
  }

  async getByFilename(fileName: string): Promise<TM.Map | undefined>
  async getByFilename(fileNames: string[]): Promise<TM.Map[]>
  async getByFilename(fileNames: string | string[]): Promise<TM.Map | TM.Map[] | undefined> {
    let isArr = true
    if (typeof fileNames === 'string') {
      isArr = false
      fileNames = [fileNames]
    } else if (fileNames.length === 0) { return [] }
    const query = `SELECT uid, name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
    author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards,
    count(votes.map_id)::int AS vote_count, sum(votes.vote) AS vote_sum FROM maps
    JOIN map_ids ON maps.id=map_ids.id
    LEFT JOIN votes ON votes.map_id=maps.id
    WHERE ${fileNames.map((a, i) => `filename=$${i + 1} OR `).join('').slice(0, -3)}
    GROUP BY (uid, name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
      author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, leaderboard_rating, awards)`
    const res = (await this.query(query, ...fileNames))
    if (isArr === false) {
      return res[0] === undefined ? undefined : this.constructMapObject({ ...res[0], filename: fileNames[0] })
    }
    return res.map((a, i) => this.constructMapObject({ ...a, filename: fileNames[i] }))
  }

  async getVoteCountAndRatio(mapId: string): Promise<{ ratio: number, count: number } | undefined>
  async getVoteCountAndRatio(mapIds: string[]): Promise<{ uid: string, ratio: number, count: number }[]>
  async getVoteCountAndRatio(mapIds: string | string[]): Promise<{ ratio: number, count: number } |
    { uid: string, ratio: number, count: number }[] | undefined> {
    let isArr = true
    if (typeof mapIds === 'string') {
      isArr = false
      mapIds = [mapIds]
    }
    const query = `SELECT uid, count(votes.map_id)::int, sum(votes.vote) FROM map_ids
    LEFT JOIN votes ON votes.map_id=map_ids.id
    WHERE ${mapIds.map((a, i) => `id=$${i + 1} OR `).join('').slice(0, -3)}
    GROUP BY uid;`
    const ids = await mapIdsRepo.get(mapIds)
    if (ids.length === 0) {
      return isArr ? [] : undefined
    }
    const res = (await this.query(query, ...ids.map(a => a.id)))
    if (isArr === false) {
      return res[0] === undefined ? undefined : { ratio: res[0].count === 0 ? 0 : (((res[0].sum / res[0].count) - 1) / 6) * 100, count: res[0].count }
    }
    return res.map(a => ({ uid: a.uid, ratio: a.count === 0 ? 0 : (((a.sum / a.count) - 1) / 6) * 100, count: a.count }))
  }

  async remove(...mapIds: string[]): Promise<void> {
    if (mapIds.length === 0) { return }
    const query = `DELETE FROM maps WHERE ${mapIds.map((a, i) => `id=$${i + 1} OR `).join('').slice(0, -3)};`
    const ids = await mapIdsRepo.get(mapIds)
    await this.query(query, ...ids.map(a => a.id))
  }

  async setCpsAndLapsAmount(uid: string, lapsAmount: number, cpsAmount: number): Promise<void> {
    const id = await mapIdsRepo.get(uid)
    const query = `UPDATE maps SET laps_amount=$1, checkpoints_amount=$2 WHERE id=$3`
    await this.query(query, lapsAmount, cpsAmount, id)
  }

  async setAwardsAndLbRating(uid: string, awards: number, lbRating: number): Promise<void> {
    const id = await mapIdsRepo.get(uid)
    const query = `UPDATE maps SET awards=$1, leaderboard_rating=$2 WHERE id=$3`
    await this.query(query, awards, lbRating, id)
  }

  private constructMapObject(entry: TableEntry): TM.Map {
    return {
      id: entry.uid,
      name: entry.name,
      fileName: entry.filename,
      author: entry.author,
      environment: Object.entries(environments).find(a => a[1] === entry.environment)?.[0] as any,
      mood: Object.entries(moods).find(a => a[1] === entry.mood)?.[0] as any,
      bronzeTime: entry.bronze_time,
      silverTime: entry.silver_time,
      goldTime: entry.gold_time,
      authorTime: entry.author_time,
      copperPrice: entry.copper_price,
      isLapRace: entry.is_lap_race,
      addDate: entry.add_date,
      lapsAmount: entry.laps_amount ?? undefined,
      checkpointsAmount: entry.checkpoints_amount ?? undefined,
      awards: entry.awards ?? undefined,
      leaderboardRating: entry.leaderboard_rating ?? undefined,
      voteCount: entry.vote_count,
      voteRatio: entry.vote_count === 0 ? -1 : entry.vote_sum / entry.vote_count,
      isClassic: entry.leaderboard_rating === 0,
      isNadeo: entry.leaderboard_rating === 50000
    }
  }

}
