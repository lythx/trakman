import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'

const createQuery: string = `
CREATE TABLE IF NOT EXISTS maps(
  id INT4 GENERATED ALWAYS AS IDENTITY,
  map_id INT4 NOT NULL,
  name VARCHAR(60) NOT NULL,
  filename VARCHAR(254) NOT NULL,
  author VARCHAR(25) NOT NULL,
  environment INT2 NOT NULL,
  mood INT2 NOT NULL,
  bronze_time INT4 NOT NULL,
  silver_time INT4 NOT NULL,
  gold_time INT4 NOT NULL,
  author_time INT4 NOT NULL,
  copper_price INT4 NOT NULL,
  is_lap_race BOOLEAN NOT NULL,
  laps_amount INT2,
  checkpoints_amount INT2,
  add_date TIMESTAMP NOT NULL,
  PRIMARY KEY(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id) 
	    REFERENCES map_ids(id)
);`

interface ITableEntry {
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
  readonly laps_amount?: number
  readonly checkpoints_amount?: number
  readonly add_date: Date
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
  }

  async add(...maps: TMMap[]): Promise<void> {
    const query = `INSERT INTO maps(map_id, name, filename, author, environment, mood, 
      bronze_time, silver_time, gold_time, author_time, copper_price, is_lap_race, 
      laps_amount, checkpoints_amount, add_date) ${this.getInsertValuesString(15, maps.length)}`
    const ids = await mapIdsRepo.addAndGetId(...maps.map(a => a.id))
    const values: any[] = []
    for (const [i, map] of maps.entries()) {
      values.push(ids[i], map.name,
        map.fileName, map.author, (environments as any)[map.environment], (moods as any)[map.mood], map.bronzeTime, map.silverTime,
        map.goldTime, map.authorTime, map.copperPrice, map.lapRace, map.lapsAmount, map.checkpointsAmount, map.addDate)
    }
    await this.query(query, ...values)
  }

  async getAll(): Promise<TMMap[]> {
    const query = 'SELECT * FROM maps INNER JOIN map_ids ON maps.map_id=map_ids.id;'
    return ((await this.db.query(query)).rows).map(a => this.constructMapObject(a))
  }

  async get(mapId: string): Promise<TMMap | undefined> {
    return this.constructMapObject((await this.db.query(`SELECT * FROM maps WHERE uid=$1 INNER JOIN map_ids ON maps.map_id=map_ids.id;`,
      [`(SELECT id FROM map_ids WHERE uid=${mapId}`])).rows[0])
  }

  private constructMapObject(entry: ITableEntry): TMMap {
    return {
      id: entry.uid,
      name: entry.name,
      fileName: entry.filename,
      author: entry.author,
      environment: Object.entries(environments).find(a => a[1] === entry.environment)?.[0] ?? '',
      mood: Object.entries(moods).find(a => a[1] === entry.mood)?.[0] ?? '',
      bronzeTime: entry.bronze_time,
      silverTime: entry.silver_time,
      goldTime: entry.gold_time,
      authorTime: entry.author_time,
      copperPrice: entry.copper_price,
      lapRace: entry.is_lap_race,
      lapsAmount: entry.laps_amount ?? -1,
      checkpointsAmount: entry.checkpoints_amount ?? -1,
      addDate: entry.add_date
    }
  }

}
