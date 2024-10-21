import config from './Config.js'

const createQueries = [`CREATE TABLE IF NOT EXISTS best_sector_records(
  map_id INT4 NOT NULL,
  player_id INT4 NOT NULL,
  index INT2 NOT NULL,
  sector INT4 NOT NULL,
  date TIMESTAMP NOT NULL,
  PRIMARY KEY(map_id, index),
  CONSTRAINT fk_player_id
    FOREIGN KEY(player_id) 
      REFERENCES players(id),
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
      REFERENCES players(id),
  CONSTRAINT fk_map_id
    FOREIGN KEY(map_id)
      REFERENCES map_ids(id)
);`]

const getQueryDBFunction = async (): Promise<(query: string, ...params: any[]) => Promise<any[] | Error>> => {
  if (config.useDBClient && config.isEnabled) {
    return await tm.db.getClient()
  }
  return tm.db.query
}
const queryDB = await getQueryDBFunction()

for (const e of createQueries) {
  await queryDB(e)
}

export const allSecsDB = {

  async get(mapDBId: number, ...playerLogins: string[]): Promise<{ sectors: (number | undefined)[], login: string, nickname: string }[] | Error> {
    if (playerLogins.length === 0) { return [] }
    const playerDBIds = await tm.db.getPlayerId(playerLogins)
    const query = `SELECT sectors, login, nickname FROM sector_records
    JOIN players ON players.id=sector_records.player_id
    WHERE map_id=$1 AND (${playerDBIds.map((_: any, i: number) => `player_id=$${i + 2} OR `).join('').slice(0, -3)});`
    const res: { sectors: number[], login: string, nickname: string }[] | Error = (await queryDB(query, mapDBId, ...playerDBIds.map(a => a.id)))
    if (res instanceof Error) {
      tm.log.error(`Error when fetching sector records of players ${playerDBIds} on map ${mapDBId}`, res.message)
      return []
    }
    return res.map(a => ({ login: a.login, sectors: a.sectors.map(b => b === -1 ? undefined : b), nickname: a.nickname }))
  },

  async add(mapId: number, login: string, sectors: number[]): Promise<void> {
    const playerDBId = await tm.db.getPlayerId(login)
    if (playerDBId === undefined) { return }
    const query = `INSERT INTO sector_records(map_id, player_id, sectors) VALUES($1, $2, $3);`
    await queryDB(query, mapId, playerDBId, sectors)
  },

  async update(mapId: number, login: string, sectors: number[]): Promise<void> {
    const playerDBId = await tm.db.getPlayerId(login)
    if (playerDBId === undefined) { return }
    const query = `UPDATE sector_records SET sectors=$1 WHERE map_id=$2 AND player_id=$3;`
    await queryDB(query, sectors, mapId, playerDBId)
  }

}

export const bestSecsDB = {

  async get(mapId: string | number): Promise<{ sector: number, date: Date, login: string, nickname: string }[] | Error> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    if (mapDBId === undefined) { return [] }
    const res: { sector: number, date: Date, index: number, login: string, nickname: string }[] | Error =
      (await queryDB(`SELECT sector, index, date, login, nickname FROM best_sector_records 
    JOIN players ON players.id=best_sector_records.player_id
    WHERE map_id=$1;`, mapId))
    if (res instanceof Error) {
      tm.log.error(`Error when fetching sector records on map ${mapDBId}`, res.message)
      return res
    }
    const ret: Omit<typeof res[0], 'index'>[] = []
    for (const e of res) {
      ret[e.index] = { sector: e.sector, date: e.date, login: e.login, nickname: e.nickname }
    }
    return ret
  },

  async add(mapId: string | number, playerId: string | number, index: number, sector: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await tm.db.getPlayerId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `INSERT INTO best_sector_records(map_id, player_id, index, sector, date) VALUES($1, $2, $3, $4, $5);`
    await queryDB(query, mapDBId, playerDBId, index, sector, date)
  },

  async update(mapId: string | number, playerId: string | number, index: number, sector: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await tm.db.getPlayerId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `UPDATE best_sector_records SET sector=$1, date=$2 WHERE map_id=$3 AND player_id=$4 AND index=$5;`
    await queryDB(query, sector, date, mapDBId, playerDBId, index)
  },

  async delete(mapId: string | number, index?: number): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await tm.db.getMapId(mapId)
    if (mapDBId === undefined) { return }
    const indexStr = index === undefined ? '' : ` AND index=$2`
    const query = `DELETE FROM best_sector_records WHERE map_id=$1${indexStr};`
    index === undefined ? await queryDB(query, mapId) : await queryDB(query, mapId, index)
  }

}
