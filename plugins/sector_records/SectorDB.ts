import { TRAKMAN as TM } from '../../src/Trakman.js'
import { BestSectors } from './SectorTypes.js'

const createQueries = [`CREATE TABLE IF NOT EXISTS best_sector_records(
  map_id INT4 NOT NULL,
  player_id INT4 NOT NULL,
  index INT2 NOT NULL,
  sector INT4 NOT NULL,
  date TIMESTAMP NOT NULL,
  PRIMARY KEY(map_id, index),
  CONSTRAINT fk_player_id
    FOREIGN KEY(player_id) 
      REFERENCES player_ids(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id)
      REFERENCES map_ids(id)
);`,
  `CREATE TABLE IF NOT EXISTS sector_records(
  map_id INT4 NOT NULL,
  player_id INT4 NOT NULL,
  sectors INT4[] NOT NULL,
  PRIMARY KEY(map_id, player_id),
  CONSTRAINT fk_player_id
    FOREIGN KEY(player_id) 
      REFERENCES player_ids(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id)
      REFERENCES map_ids(id)
);`]

const DB = new TM.DatabaseClient()

await DB.initialize()
for (const e of createQueries) {
  await DB.query(e)
}

export const allSecsDB = {

  async get(mapDBId: number, ...playerLogins: string[]): Promise<{ sectors: (number | undefined)[], login: string }[] | Error> {
    if (playerLogins.length === 0) { return [] }
    const playerDBIds = await TM.getPlayerDBId(playerLogins)
    const query = `SELECT sectors, login FROM sector_records
    JOIN player_ids ON player_ids.id=sector_records.player_id
    WHERE map_id=$1 AND (${playerDBIds.map((_: any, i: number) => `player_id=$${i + 2} OR `).join('').slice(0, -3)});`
    const res: { sectors: number[], login: string }[] | Error = (await DB.query(query, mapDBId, ...playerDBIds.map(a => a.id))).rows
    if (res instanceof Error) {
      TM.error(`Error when fetching sector records of players ${playerDBIds} on map ${mapDBId}`, res.message)
      return []
    }
    return res.map(a => ({ login: a.login, sectors: a.sectors.map(b => b === -1 ? undefined : b) }))
  },

  async add(mapId: number, login: string, sectors: number[]): Promise<void> {
    const playerDBId = await TM.getPlayerDBId(login)
    if (playerDBId === undefined) { return }
    const query = `INSERT INTO sector_records(map_id, player_id, sectors) VALUES($1, $2, $3);`
    await DB.query(query, mapId, playerDBId, sectors)
  },

  async update(mapId: number, login: string, sectors: number[]): Promise<void> {
    const playerDBId = await TM.getPlayerDBId(login)
    if (playerDBId === undefined) { return }
    const query = `UPDATE sector_records SET sectors=$1 WHERE map_id=$2 AND player_id=$3;`
    await DB.query(query, sectors, mapId, playerDBId)
  }

}

export const bestSecsDB = {

  async get(mapId: string | number): Promise<{ sector: number, date: Date, login: string, nickname: string }[] | Error> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.db.getMapId(mapId)
    if (mapDBId === undefined) { return [] }
    const res: { sector: number, date: Date, index: number, login: string, nickname: string }[] | Error =
      (await DB.query(`SELECT sector, index, date, login, nickname FROM best_sector_records 
    JOIN players ON players.id=best_sector_records.player_id
    JOIN player_ids ON player_ids.id=best_sector_records.player_id
    WHERE map_id=$1;`, mapId)).rows
    if (res instanceof Error) {
      TM.error(`Error when fetching sector records on map ${mapDBId}`, res.message)
    }
    const ret: Omit<typeof res[0], 'index'>[] = []
    for (const e of res) {
      ret[e.index] = { sector: e.sector, date: e.date, login: e.login, nickname: e.nickname }
    }
    return ret
  },

  async add(mapId: string | number, playerId: string | number, index: number, sector: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.db.getMapId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await TM.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `INSERT INTO best_sector_records(map_id, player_id, index, sector, date) VALUES($1, $2, $3, $4, $5);`
    await DB.query(query, mapDBId, playerDBId, index, sector, date)
  },

  async update(mapId: string | number, playerId: string | number, index: number, sector: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.db.getMapId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await TM.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `UPDATE best_sector_records SET sector=$1, date=$2 WHERE map_id=$3 AND player_id=$4 AND index=$5;`
    await DB.query(query, sector, date, mapDBId, playerDBId, index)
  },

  async delete(mapId: string | number, index?: number): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.db.getMapId(mapId)
    if (mapDBId === undefined) { return }
    const indexStr = index === undefined ? '' : ` AND index=$2`
    const query = `DELETE FROM best_sector_records WHERE map_id=$1${indexStr};`
    index === undefined ? await DB.query(query, mapId) : await DB.query(query, mapId, index)
  }

}

async function fetchMapSectors(mapId: string): Promise<BestSectors | void>
async function fetchMapSectors(...mapId: string[]): Promise<BestSectors[]>
async function fetchMapSectors(mapIds: string | string[]): Promise<BestSectors | void | BestSectors[]> {
  if (Array.isArray(mapIds)) {
    const str = mapIds.map((a, i) => `mapId=$${i} OR `).join('')
    const res: BestSectors[] | Error = await TM.db.query(`SELECT * FROM secrecs WHERE ${str.substring(0, str.length - 3)};`, [mapIds])
    if (res instanceof Error) {
      TM.error(`Error when fetching sector records for maps ${mapIds.join(',')}`, res.message)
      return
    } else if (res.length === 1) {
      return res
    }
    return
  }
  const res: BestSectors[] | Error = await TM.db.query('SELECT * FROM secrecs WHERE mapId=$1;', [mapIds])
  if (res instanceof Error) {
    TM.error(`Error when fetching sector records for map ${mapIds}`, res.message)
    return
  } else if (res.length === 1) {
    return res[0]
  }
}

export { fetchMapSectors }