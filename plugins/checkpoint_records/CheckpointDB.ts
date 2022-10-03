import config from './Config.js'

const createQueries = [`CREATE TABLE IF NOT EXISTS best_checkpoint_records(
  map_id INT4 NOT NULL,
  player_id INT4 NOT NULL,
  index INT2 NOT NULL,
  checkpoint INT4 NOT NULL,
  date TIMESTAMP NOT NULL,
  PRIMARY KEY(map_id, index),
  CONSTRAINT fk_player_id
    FOREIGN KEY(player_id) 
      REFERENCES players(id),
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
      REFERENCES players(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id)
      REFERENCES map_ids(id)
);`]

// Use client because queries happen quite often in this plugin
const getQueryDBFunction = async (): Promise<(query: string, ...params: any[]) => Promise<any[] | Error>> => {
  if (config.useDBClient === true && config.isEnabled === true) {
    return await tm.db.getClient()
  }
  return tm.db.query
}
const queryDB = await getQueryDBFunction()

for (const e of createQueries) {
  queryDB(e)
}

export const allCpsDB = {

  async get(mapDBId: number, ...playerLogins: string[]):
    Promise<{ checkpoints: (number | undefined)[], login: string, nickname: string }[] | Error> {
    if (playerLogins.length === 0) { return [] }
    const playerDBIds = await tm.getPlayerDBId(playerLogins)
    const query = `SELECT checkpoints, login, nickname FROM checkpoint_records
    JOIN players ON players.id=checkpoint_records.player_id
    WHERE map_id=$1 AND (${playerDBIds.map((_: any, i: number) => `player_id=$${i + 2} OR `).join('').slice(0, -3)});`
    const res: { checkpoints: number[], login: string, nickname: string }[] | Error =
      (await queryDB(query, mapDBId, ...playerDBIds.map(a => a.id)))
    if (res instanceof Error) {
      tm.log.error(`Error when fetching checkpoints records of players ${playerDBIds} on map ${mapDBId}`, res.message)
      return []
    }
    return res.map(a => ({ login: a.login, nickname: a.nickname, checkpoints: a.checkpoints.map(b => b === -1 ? undefined : b) }))
  },

  async add(mapId: number, login: string, checkpoints: number[]): Promise<void> {
    const playerDBId = await tm.getPlayerDBId(login)
    if (playerDBId === undefined) { return }
    const query = `INSERT INTO checkpoint_records(map_id, player_id, checkpoints) VALUES($1, $2, $3);`
    await queryDB(query, mapId, playerDBId, checkpoints)
  },

  async update(mapId: number, login: string, checkpoints: number[]): Promise<void> {
    const playerDBId = await tm.getPlayerDBId(login)
    if (playerDBId === undefined) { return }
    const query = `UPDATE checkpoint_records SET checkpoints=$1 WHERE map_id=$2 AND player_id=$3;`
    await queryDB(query, checkpoints, mapId, playerDBId)
  }

}

export const bestCpsDB = {

  async get(mapId: string | number): Promise<{ checkpoint: number, date: Date, login: string, nickname: string }[] | Error> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    if (mapDBId === undefined) { return [] }
    const res: { checkpoint: number, date: Date, index: number, login: string, nickname: string }[] | Error =
      (await queryDB(`SELECT checkpoint, index, date, login, nickname FROM best_checkpoint_records 
    JOIN players ON players.id=best_checkpoint_records.player_id
    WHERE map_id=$1;`, mapId))
    if (res instanceof Error) {
      tm.log.error(`Error when fetching checkpoint records on map ${mapDBId}`, res.message)
      return res
    }
    const ret: Omit<typeof res[0], 'index'>[] = []
    for (const e of res) {
      ret[e.index] = { checkpoint: e.checkpoint, date: e.date, login: e.login, nickname: e.nickname }
    }
    return ret
  },

  async add(mapId: string | number, playerId: string | number, index: number, checkpoint: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await tm.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `INSERT INTO best_checkpoint_records(map_id, player_id, index, checkpoint, date) VALUES($1, $2, $3, $4, $5);`
    await queryDB(query, mapDBId, playerDBId, index, checkpoint, date)
  },

  async update(mapId: string | number, playerId: string | number, index: number, checkpoint: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await tm.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `UPDATE best_checkpoint_records SET checkpoint=$1, date=$2 WHERE map_id=$3 AND player_id=$4 AND index=$5;`
    await queryDB(query, checkpoint, date, mapDBId, playerDBId, index)
  },

  async delete(mapId: string | number, index?: number): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    if (mapDBId === undefined) { return }
    const indexStr = index === undefined ? '' : ` AND index=$2`
    const query = `DELETE FROM best_checkpoint_records WHERE map_id=$1${indexStr};`
    index === undefined ? await queryDB(query, mapId) : await queryDB(query, mapId, index)
  }

}
