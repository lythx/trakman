import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'

const createQuery: string = `
CREATE TABLE IF NOT EXISTS maps(
  id INT4 NOT NULL,
  name VARCHAR(60) NOT NULL,
  filename VARCHAR(254) NOT NULL UNIQUE,
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
    FOREIGN KEY(id) 
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
  readonly laps_amount: number | null
  readonly checkpoints_amount: number | null
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
    if (maps.length === 0) { return }
    const query = `INSERT INTO maps(id, name, filename, author, environment, mood, 
      bronze_time, silver_time, gold_time, author_time, copper_price, is_lap_race, 
      laps_amount, checkpoints_amount, add_date) ${this.getInsertValuesString(15, maps.length)}`
    const ids = await mapIdsRepo.addAndGet(maps.map(a => a.id))
    const values: any[] = []
    for (const [i, map] of maps.entries()) {
      values.push(ids[i].id, map.name,
        map.fileName, map.author, environments[map.environment], moods[map.mood], map.bronzeTime, map.silverTime,
        map.goldTime, map.authorTime, map.copperPrice, map.isLapRace, map.lapsAmount, map.checkpointsAmount, map.addDate)
    }
    await this.query(query, ...values)
  }

  async getAll(): Promise<TMMap[]> {
    const query = `SELECT name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
    author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, uid FROM maps 
    JOIN map_ids ON maps.id=map_ids.id;`
    return ((await this.query(query))).map(a => this.constructMapObject(a))
  }

  async get(mapId: string): Promise<TMMap | undefined>
  async get(mapIds: string[]): Promise<TMMap[]>
  async get(mapIds: string | string[]): Promise<TMMap | TMMap[] | undefined> {
    let isArr = true
    if (typeof mapIds === 'string') {
      isArr = false
      mapIds = [mapIds]
    } else if (mapIds.length === 0) { return [] }
    const query = `SELECT name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
    author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, uid FROM maps
    JOIN map_ids ON maps.id=map_ids.id
    WHERE ${mapIds.map((a, i) => `id=$${i + 1} OR`).join('').slice(0, -3)};`
    const ids = await mapIdsRepo.get(mapIds)
    const res = (await this.query(query, ...ids.map(a => a.id)))
    if (isArr === false) {
      return res[0] === undefined ? undefined : this.constructMapObject(res[0])
    }
    return res.map(a => this.constructMapObject(a))
  }

  async getByFilename(fileName: string): Promise<TMMap | undefined>
  async getByFilename(fileNames: string[]): Promise<TMMap[]>
  async getByFilename(fileNames: string | string[]): Promise<TMMap | TMMap[] | undefined> {
    let isArr = true
    if (typeof fileNames === 'string') {
      isArr = false
      fileNames = [fileNames]
    } else if (fileNames.length === 0) { return [] }
    const query = `SELECT name, filename, author, environment, mood, bronze_time, silver_time, gold_time,
    author_time, copper_price, is_lap_race, laps_amount, checkpoints_amount, add_date, uid FROM maps
    JOIN map_ids ON maps.id=map_ids.id
    WHERE ${fileNames.map((a, i) => `filename=$${i + 1} OR`).join('').slice(0, -3)};`
    const res = (await this.query(query, ...fileNames))
    if (isArr === false) {
      return res[0] === undefined ? undefined : this.constructMapObject({ ...res[0], filename: fileNames[0] })
    }
    return res.map((a, i) => this.constructMapObject({ ...a, filename: fileNames[i] }))
  }

  async remove(...mapIds: string[]): Promise<void> {
    if (mapIds.length === 0) { return }
    const query = `DELETE FROM maps WHERE ${mapIds.map((a, i) => `id=$${i + 1} OR`).join('').slice(0, -3)};`
    const ids = await mapIdsRepo.get(mapIds)
    await this.query(query, ...ids.map(a => a.id))
  }

  async setCpsAndLapsAmount(uid: string, lapsAmount: number, cpsAmount: number): Promise<void> {
    const id = await mapIdsRepo.get(uid)
    const query = `UPDATE maps SET laps_amount=$1, checkpoints_amount=$2 WHERE id=$3`
    await this.query(query, lapsAmount, cpsAmount, id)
  }

  private constructMapObject(entry: TableEntry): TMMap {
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
      lapsAmount: entry.laps_amount ?? undefined,
      checkpointsAmount: entry.checkpoints_amount?? undefined,
      addDate: entry.add_date
    }
  }

}
