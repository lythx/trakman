import { TRAKMAN as TM } from '../src/Trakman.js'

type BestSectors = ({
  login: string
  nickname: string
  sector: number
  date: Date
} | undefined)[]

interface PlayerSectors {
  readonly login: string
  readonly sectors: (number | undefined)[]
}

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

DB.initialize()
for (const e of createQueries) {
  DB.query(e)
}

const allSecsDB = {

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

const bestSecsDB = {

  async get(mapId: string | number): Promise<{ sector: number, date: Date, login: string, nickname: string }[] | Error> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
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
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await TM.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `INSERT INTO best_sector_records(map_id, player_id, index, sector, date) VALUES($1, $2, $3, $4, $5);`
    await DB.query(query, mapDBId, playerDBId, index, sector, date)
  },

  async update(mapId: string | number, playerId: string | number, index: number, sector: number, date: Date): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    const playerDBId = typeof playerId === 'number' ? playerId : await TM.getPlayerDBId(playerId)
    if (mapDBId === undefined || playerDBId === undefined) { return }
    const query = `UPDATE best_sector_records SET sector=$1, date=$2 WHERE map_id=$3 AND player_id=$4 AND index=$5;`
    await DB.query(query, sector, date, mapDBId, playerDBId, index)
  },

  async delete(mapId: string | number, index?: number): Promise<void> {
    const mapDBId = typeof mapId === 'number' ? mapId : await TM.getMapDBId(mapId)
    if (mapDBId === undefined) { return }
    const indexStr = index === undefined ? '' : ` AND index=$2`
    const query = `DELETE FROM best_sector_records WHERE map_id=$1${indexStr};`
    index === undefined ? await DB.query(query, mapId) : await DB.query(query, mapId, index)
  }

}

let currentBestSecs: BestSectors

let currentMapDBId: number

const currentPlayerSecs: PlayerSectors[] = []

const fetchListeners: ((mapSectors: BestSectors, playerSectors: PlayerSectors[]) => void)[] = []

const bestDeleteListeners: ((mapSectors: BestSectors, playerSectors: PlayerSectors[]) => void)[] = []

const bestSectorListeners: ((login: string, nickname: string, index: number, date: Date) => void)[] = []

const playerSectorListeners: ((login: string, nickname: string, index: number) => void)[] = []

const playerDeleteListeners: ((login: string) => void)[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await TM.getMapDBId(TM.map.id)
  if (DBId === undefined) {
    await TM.fatalError(`Failed to fetch current map (${TM.map.id}) id from database`)
    return
  }
  currentMapDBId = DBId
  const res = await bestSecsDB.get(currentMapDBId)
  if (res instanceof Error) {
    await TM.fatalError(`Failed to fetch best sectors for map ${TM.map.id}`, res.message)
    return
  }
  currentBestSecs = res
  const playerSecs = await allSecsDB.get(currentMapDBId, ...TM.players.map(a => a.login))
  if (playerSecs instanceof Error) {
    await TM.fatalError(`Failed to fetch player sectors for map ${TM.map.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.length = 0
  currentPlayerSecs.push(...playerSecs)
  for (const e of fetchListeners) {
    e(currentBestSecs, currentPlayerSecs)
  }
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  await onMapStart()
}, true)

TM.addListener('Controller.BeginMap', async (): Promise<void> => {
  await onMapStart()
}, true)

TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
  const date = new Date()
  const playerSectors = currentPlayerSecs.find(a => a.login === info.player.login)
  const time = info.time - (info.player.currentCheckpoints[info.index - 1]?.time ?? 0)
  if (playerSectors === undefined) {
    currentPlayerSecs.push({ login: info.player.login, sectors: [time] })
    void allSecsDB.add(currentMapDBId, info.player.login, [time])
    for (const e of playerSectorListeners) {
      e(info.player.login, info.player.nickname, info.index)
    }
  } else if (playerSectors.sectors[info.index] === undefined || playerSectors.sectors[info.index] as any > time) {
    playerSectors.sectors[info.index] = time
    void allSecsDB.update(currentMapDBId, info.player.login, playerSectors.sectors.map(a => a === undefined ? -1 : a))
    for (const e of playerSectorListeners) {
      e(info.player.login, info.player.nickname, info.index)
    }
  }
  const sector = currentBestSecs[info.index]?.sector
  if (sector === undefined || sector > time) {
    currentBestSecs[info.index] = {
      login: info.player.login,
      nickname: info.player.nickname,
      sector: time,
      date: date
    }
    sector === undefined ? void bestSecsDB.add(currentMapDBId, info.player.login, info.index, time, date)
      : void bestSecsDB.update(currentMapDBId, info.player.login, info.index, time, date)
    for (const e of bestSectorListeners) {
      e(info.player.login, info.player.nickname, info.index, date)
    }
  }
})

TM.addListener('Controller.PlayerFinish', (info: FinishInfo) => {
  const date = new Date()
  const index = info.checkpoints.length
  const playerSectors = currentPlayerSecs.find(a => a.login === info.login)
  const time = info.time - (info.checkpoints[index - 1] ?? 0)
  if (playerSectors === undefined) {
    currentPlayerSecs.push({ login: info.login, sectors: [time] })
    void allSecsDB.add(currentMapDBId, info.login, [time])
    for (const e of playerSectorListeners) {
      e(info.login, info.nickname, index)
    }
  } else if (playerSectors.sectors[index] === undefined || playerSectors.sectors[index] as any > time) {
    playerSectors.sectors[index] = time
    void allSecsDB.update(currentMapDBId, info.login, playerSectors.sectors.map(a => a === undefined ? -1 : a))
    for (const e of playerSectorListeners) {
      e(info.login, info.nickname, index)
    }
  }
  const sector = currentBestSecs[index]?.sector
  if (sector === undefined || sector > time) {
    currentBestSecs[index] = {
      login: info.login,
      nickname: info.nickname,
      sector: time,
      date: date
    }
    sector === undefined ? void bestSecsDB.add(currentMapDBId, info.login, index, time, date)
      : void bestSecsDB.update(currentMapDBId, info.login, index, time, date)
    for (const e of bestSectorListeners) {
      e(info.login, info.nickname, index, date)
    }
  }
})

TM.addCommand({
  aliases: ['delmysec', 'deletemysector'],
  help: 'Delete player personal sectors or one sector on the current map. Index is 1 based',
  params: [{ name: 'sectorIndex', type: 'int', optional: true }],
  callback(info, sectorIndex?: number) {
    const secs = currentPlayerSecs.find(a => a.login === info.login)
    if (secs === undefined) {
      TM.sendMessage(`You have no sector records on ongoing map`, info.login)
      return
    }
    if (sectorIndex === undefined) {
      secs.sectors.length = 0
      TM.sendMessage(`Deleted sectors on current map`, info.login)
      void allSecsDB.update(currentMapDBId, info.login, secs.sectors.map(a => a === undefined ? -1 : a))
    } else {
      if (sectorIndex < 1 || sectorIndex > TM.map.checkpointsAmount) {
        TM.sendMessage(`Sector needs to be higher than 0 and lower or equal to current maps sectors amount`, info.login)
        return
      }
      secs.sectors[sectorIndex - 1] = undefined
      TM.sendMessage(`Deleted sector number ${sectorIndex}`, info.login)
      void allSecsDB.update(currentMapDBId, info.login, secs.sectors.map(a => a === undefined ? -1 : a))
    }
    for (const e of playerDeleteListeners) {
      e(info.login)
    }
  },
  privilege: 0
})

TM.addCommand({
  aliases: ['delsec', 'deletesector'],
  help: 'Delete all sector records or one sector record on current map. Index is 1 based',
  params: [{ name: 'sectorIndex', type: 'int', optional: true }],
  callback(info, sectorIndex?: number) {
    if (sectorIndex === undefined) {
      currentBestSecs.length = 0
      TM.sendMessage(`${TM.strip(info.nickname)} deleted sectors on current map`)
      void bestSecsDB.delete(currentMapDBId)
    } else {
      if (sectorIndex < 1 || sectorIndex > TM.map.checkpointsAmount + 1) {
        TM.sendMessage(`Sector needs to be higher than 0 and lower or equal to current maps sectors amount`, info.login)
        return
      }
      currentBestSecs[sectorIndex - 1] = undefined
      TM.sendMessage(`${TM.strip(info.nickname)} deleted sector number ${sectorIndex} on current map`)
      void bestSecsDB.delete(currentMapDBId, sectorIndex - 1)
    }
    for (const e of bestDeleteListeners) {
      e(currentBestSecs, currentPlayerSecs)
    }
  },
  privilege: 2
})

function addListener(event: 'BestSector', callback: ((login: string, nickname: string, index: number, date: Date) => void)): void
function addListener(event: 'SectorsFetch', callback: ((sectors: BestSectors) => void)): void
function addListener(event: 'DeleteBestSector', callback: ((sectors: BestSectors) => void)): void
function addListener(event: 'DeletePlayerSector', callback: ((login: string) => void)): void
function addListener(event: 'PlayerSector', callback: ((login: string, nickname: string, index: number) => void)): void
function addListener(event: 'BestSector' | 'SectorsFetch' | 'PlayerSector' | 'DeleteBestSector' | 'DeletePlayerSector', callback: Function) {
  switch (event) {
    case 'BestSector':
      bestSectorListeners.push(callback as any)
      return
    case 'DeleteBestSector':
      bestDeleteListeners.push(callback as any)
      return
    case 'DeletePlayerSector':
      playerDeleteListeners.push(callback as any)
      return
    case 'SectorsFetch':
      fetchListeners.push(callback as any)
      return
    case 'PlayerSector':
      playerSectorListeners.push(callback as any)
      return
  }
}

async function fetchMapSectors(mapId: string): Promise<BestSectors | void>
async function fetchMapSectors(...mapId: string[]): Promise<BestSectors[]>
async function fetchMapSectors(mapIds: string | string[]): Promise<BestSectors | void | BestSectors[]> {
  if (Array.isArray(mapIds)) {
    const str = mapIds.map((a, i) => `mapId=$${i} OR `).join('')
    const res: BestSectors[] | Error = await TM.queryDB(`SELECT * FROM secrecs WHERE ${str.substring(0, str.length - 3)};`, [mapIds])
    if (res instanceof Error) {
      TM.error(`Error when fetching sector records for maps ${mapIds.join(',')}`, res.message)
      return
    } else if (res.length === 1) {
      return res
    }
    return
  }
  const res: BestSectors[] | Error = await TM.queryDB('SELECT * FROM secrecs WHERE mapId=$1;', [mapIds])
  if (res instanceof Error) {
    TM.error(`Error when fetching sector records for map ${mapIds}`, res.message)
    return
  } else if (res.length === 1) {
    return res[0]
  }
}

export const sectorRecords = {

  get mapSectors(): ({ login: string, nickname: string, sector: number, date: Date } | null)[] {
    const arr: ({ login: string, nickname: string, sector: number, date: Date } | null)[] = new Array(TM.map.checkpointsAmount).fill(null)
    for (const [i, e] of currentBestSecs.entries()) {
      arr[i] = e ?? null
    }
    return arr
  },

  get playerSectors(): ({ login: string, sectors: (number | null)[] })[] {
    const arr: ({ login: string, sectors: (number | null)[] })[] = []
    for (const [i, e] of TM.players.entries()) {
      arr[i] = {
        login: e.login,
        sectors: new Array(TM.map.checkpointsAmount).fill(null).map((a, i) => currentPlayerSecs.find(a => a.login === e.login)?.sectors[i] ?? null)
      }
    }
    return arr
  },

  addListener,

  fetchMapSectors

}