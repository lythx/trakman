import { TRAKMAN as TM } from '../../src/Trakman.js'
import { BestCheckpoints } from './CheckpointTypes.js'

const createQueries = [`CREATE TABLE IF NOT EXISTS best_checkpoint_records(
  map_id INT4 NOT NULL,
  player_id INT4 NOT NULL,
  index INT2 NOT NULL,
  checkpoint INT4 NOT NULL,
  date TIMESTAMP NOT NULL,
  PRIMARY KEY(map_id, index),
  CONSTRAINT fk_player_id
    FOREIGN KEY(player_id) 
      REFERENCES player_ids(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id)
      REFERENCES map_ids(id)
);`,
  `CREATE TABLE IF NOT EXISTS checkpoint_records(
  map_id INT4 NOT NULL,
  player_id INT4 NOT NULL,
  checkpoints INT4[] NOT NULL,
  PRIMARY KEY(map_id, player_id),
  CONSTRAINT fk_player_id
    FOREIGN KEY(player_id) 
      REFERENCES player_ids(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id)
      REFERENCES map_ids(id)
);`]

const DB = new TM.DatabaseClient()

DB.initialize()
for (const e of createQueries) {
  DB.query(e)
}

export const allCpsDB = {

  async get(mapDBId: number, ...playerLogins: string[]): Promise<{ checkpoints: (number | undefined)[], login: string }[] | Error> {
    if (playerLogins.length === 0) { return [] }
    const playerDBIds = await TM.getPlayerDBId(playerLogins)
    const query = `SELECT checkpoints, login FROM checkpoint_records
    JOIN player_ids ON player_ids.id=checkpoint_records.player_id
    WHERE map_id=$1 AND (${playerDBIds.map((_: any, i: number) => `player_id=$${i + 2} OR `).join('').slice(0, -3)});`
    const res: { checkpoints: number[], login: string }[] | Error = (await DB.query(query, mapDBId, ...playerDBIds.map(a => a.id))).rows
    if (res instanceof Error) {
      TM.error(`Error when fetching checkpoints records of players ${playerDBIds} on map ${mapDBId}`, res.message)
      return []
    }
    return res.map(a => ({ login: a.login, checkpoints: a.checkpoints.map(b => b === -1 ? undefined : b) }))
  },

  async add(mapId: number, login: string, checkpoints: number[]): Promise<void> {
    const playerDBId = await TM.getPlayerDBId(login)
    if (playerDBId === undefined) { return }
    const query = `INSERT INTO checkpoint_records(map_id, player_id, checkpoints) VALUES($1, $2, $3);`
    await DB.query(query, mapId, playerDBId, checkpoints)
  },

  async update(mapId: number, login: string, checkpoints: number[]): Promise<void> {
    const playerDBId = await TM.getPlayerDBId(login)
    if (playerDBId === undefined) { return }
    const query = `UPDATE checkpoint_records SET checkpoints=$1 WHERE map_id=$2 AND player_id=$3;`
    await DB.query(query, checkpoints, mapId, playerDBId)
  }

}

export const bestSecsDB = {

  async get(mapId: string | number): Promise<{ checkpoint: number, date: Date, login: string, nickname: string }[] | Error> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    if (mapDBId === undefined) { return [] }
    const res: { checkpoint: number, date: Date, index: number, login: string, nickname: string }[] | Error =
      (await DB.query(`SELECT checkpoint, index, date, login, nickname FROM best_checkpoint_records 
    JOIN players ON players.id=best_checkpoint_records.player_id
    JOIN player_ids ON player_ids.id=best_checkpoint_records.player_id
    WHERE map_id=$1;`, mapId)).rows
    if (res instanceof Error) {
      TM.error(`Error when fetching checkpoint records on map ${mapDBId}`, res.message)
    }
    const ret: Omit<typeof res[0], 'index'>[] = []
    for (const e of res) {
      ret[e.index] = { checkpoint: e.checkpoint, date: e.date, login: e.login, nickname: e.nickname }
    }
    return ret
  },

  async add(mapId: string | number, playerId: string | number, index: number, checkpoint: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await TM.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `INSERT INTO best_checkpoint_records(map_id, player_id, index, checkpoint, date) VALUES($1, $2, $3, $4, $5);`
    await DB.query(query, mapDBId, playerDBId, index, checkpoint, date)
  },

  async update(mapId: string | number, playerId: string | number, index: number, checkpoint: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await TM.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `UPDATE best_checkpoint_records SET checkpoint=$1, date=$2 WHERE map_id=$3 AND player_id=$4 AND index=$5;`
    await DB.query(query, checkpoint, date, mapDBId, playerDBId, index)
  },

  async delete(mapId: string | number, index?: number): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    if (mapDBId === undefined) { return }
    const indexStr = index === undefined ? '' : ` AND index=$2`
    const query = `DELETE FROM best_checkpoint_records WHERE map_id=$1${indexStr};`
    index === undefined ? await DB.query(query, mapId) : await DB.query(query, mapId, index)
  }

}

async function fetchMapCheckpoints(mapId: string): Promise<BestCheckpoints | void>
async function fetchMapCheckpoints(...mapId: string[]): Promise<BestCheckpoints[]>
async function fetchMapCheckpoints(mapIds: string | string[]): Promise<BestCheckpoints | void | BestCheckpoints[]> {
  if (Array.isArray(mapIds)) {
    const str = mapIds.map((a, i) => `mapId=$${i} OR `).join('')
    const res: BestCheckpoints[] | Error = await TM.queryDB(`SELECT * FROM secrecs WHERE ${str.substring(0, str.length - 3)};`, [mapIds])
    if (res instanceof Error) {
      TM.error(`Error when fetching checkpoint records for maps ${mapIds.join(',')}`, res.message)
      return
    } else if (res.length === 1) {
      return res
    }
    return
  }
  const res: BestCheckpoints[] | Error = await TM.queryDB('SELECT * FROM secrecs WHERE mapId=$1;', [mapIds])
  if (res instanceof Error) {
    TM.error(`Error when fetching checkpoint records for map ${mapIds}`, res.message)
    return
  } else if (res.length === 1) {
    return res[0]
  }
}

export { fetchMapCheckpoints  }