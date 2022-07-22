import { TRAKMAN as TM } from '../src/Trakman.js'

interface MapSectors {
  readonly mapId: string
  readonly logins: string[]
  readonly nicknames: string[]
  readonly sectors: number[]
  readonly dates: Date[]
}

interface PlayerSectors {
  readonly mapId: string
  readonly login: string
  readonly sectors: number[]
}

const createQueries = [`CREATE TABLE IF NOT EXISTS mapsecrecs(
  mapId VARCHAR(27) NOT NULL,
  logins VARCHAR(25)[],
  nicknames VARCHAR(45)[],
  sectors INT4[],
  dates TIMESTAMP[],
  PRIMARY KEY(mapId)
);`,
  `CREATE TABLE IF NOT EXISTS secrecs(
  mapId VARCHAR(27) NOT NULL,
  login VARCHAR(25),
  sectors INT4[],
  PRIMARY KEY(mapId, login)
);`]

let mapSectors: MapSectors

const sectors: PlayerSectors[] = []

const fetchListeners: ((mapSectors: MapSectors, playerSectors: PlayerSectors[]) => void)[] = []

const bestSectorListeners: ((login: string, nickname: string, index: number, date: Date) => void)[] = []

const playerSectorListeners: ((login: string, nickname: string, index: number) => void)[] = []

const addMapSectors = async (): Promise<void> => {
  const query = `INSERT INTO mapsecrecs(mapId, logins, nicknames, sectors, dates) VALUES($1, $2, $3, $4, $5);`
  await TM.queryDB(query, [mapSectors.mapId, mapSectors.logins, mapSectors.nicknames, mapSectors.sectors, mapSectors.dates])
}

const addPlayerSector = async (mapId: string, login: string, sectors: number[]): Promise<void> => {
  const query = `INSERT INTO secrecs(mapId, login, sectors) VALUES($1, $2, $3);`
  await TM.queryDB(query, [mapId, login, sectors])
}

const getMapSectors = async (mapId: string): Promise<void> => {
  const res: MapSectors[] | Error = await TM.queryDB('SELECT * FROM mapsecrecs WHERE mapId=$1;', [mapId])
  if (res instanceof Error) {
    TM.error(`Error when fetching sector records on map ${mapId}`, res.message)
    return
  }
  if (res[0] === undefined) {
    mapSectors = { mapId, logins: [], nicknames: [], sectors: [], dates: [] }
    void addMapSectors()
  } else {
    mapSectors = res[0]
  }
}

const getPlayerSectors = async (mapId: string, login: string): Promise<PlayerSectors | undefined> => {
  const res: PlayerSectors[] | Error = await TM.queryDB('SELECT * FROM secrecs WHERE mapId=$1 AND login=$2;', [mapId, login])
  if (res instanceof Error) {
    TM.error(`Error when fetching sector records of ${login} on map ${mapId}`, res.message)
    return
  }
  return res[0]
}

const updateMapSectors = async (): Promise<void> => {
  const query = `UPDATE mapsecrecs SET logins=$1, nicknames=$2, sectors=$3, dates=$4 WHERE mapId=$5;`
  const res: MapSectors[] | Error = await TM.queryDB(query, [mapSectors.logins, mapSectors.nicknames, mapSectors.sectors, mapSectors.dates, mapSectors.mapId])
  if (res instanceof Error) {
    TM.error(`Error when updating sector records`, res.message)
  }
}

const updatePlayerSectors = async (mapId: string, login: string, sectors: number[]): Promise<void> => {
  const query = `UPDATE secrecs SET sectors=$1 WHERE mapId=$2 AND login=$3;`
  const res: MapSectors[] | Error = await TM.queryDB(query, [sectors, mapId, login])
  if (res instanceof Error) {
    TM.error(`Error when updating sector records for player ${login}`, res.message)
  }
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  for (const query of createQueries) {
    await TM.queryDB(query)
  }
  void getMapSectors(TM.map.id)
  for (const e of TM.players) {
    const sec = await getPlayerSectors(TM.map.id, e.login)
    if (sec !== undefined) { sectors.push(sec) }
  }
  for (const e of fetchListeners) {
    e(mapSectors, sectors)
  }
}, true)

TM.addListener('Controller.BeginMap', (info: BeginMapInfo): void => {
  void getMapSectors(info.id)
  sectors.length = 0
  for (const e of TM.players) {
    const sec = void getPlayerSectors(TM.map.id, e.login)
    if (sec !== undefined) { sectors.push(sec) }
  }
  for (const e of fetchListeners) {
    e(mapSectors, sectors)
  }
}, true)

TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
  const date = new Date()
  const playerSectors = sectors.find(a => a.login === info.player.login)
  if (playerSectors === undefined) {
    sectors.push({ mapId: mapSectors.mapId, login: info.player.login, sectors: [info.time] })
    void addPlayerSector(mapSectors.mapId, info.player.login, [info.time])
  } else if (playerSectors.sectors[info.index] === undefined || playerSectors.sectors[info.index] > info.time) {
    playerSectors.sectors[info.index] = info.time - (info.player.checkpoints[info.index - 1]?.time ?? 0)
    void updatePlayerSectors(mapSectors.mapId, info.player.login, playerSectors.sectors)
  }
  const sector = mapSectors.sectors[info.index]
  if (sector === undefined || sector > info.time) {
    mapSectors.logins[info.index] = info.player.login
    mapSectors.nicknames[info.index] = info.player.nickname
    mapSectors.sectors[info.index] = info.time - (info.player.checkpoints[info.index - 1]?.time ?? 0)
    mapSectors.dates[info.index] = date
    void updateMapSectors()
    for (const e of bestSectorListeners) {
      e(info.player.login, info.player.nickname, info.index, date)
    }
  }
})

TM.addListener('Controller.PlayerFinish', (info: FinishInfo) => {
  const date = new Date()
  const index = info.checkpoints.length
  const playerSectors = sectors.find(a => a.login === info.login)
  if (playerSectors === undefined) {
    sectors.push({ mapId: mapSectors.mapId, login: info.login, sectors: [info.time] })
    void addPlayerSector(mapSectors.mapId, info.login, [info.time])
  } else if (playerSectors.sectors[index] === undefined || playerSectors.sectors[index] > info.time) {
    playerSectors.sectors[index] = info.time - (info.checkpoints[index - 1] ?? 0)
    void updatePlayerSectors(mapSectors.mapId, info.login, playerSectors.sectors)
  }
  const sector = mapSectors.sectors[index]
  if (sector === undefined || sector > info.time) {
    mapSectors.logins[index] = info.login
    mapSectors.nicknames[index] = info.nickname
    mapSectors.sectors[index] = info.time - (info.checkpoints[index - 1] ?? 0)
    mapSectors.dates[index] = date
    void updateMapSectors()
    for (const e of bestSectorListeners) {
      e(info.login, info.nickname, index, date)
    }
  }
})

function addListener(event: 'BestSector', callback: ((login: string, nickname: string, index: number, date: Date) => void)): void

function addListener(event: 'SectorsFetch', callback: ((sectors: MapSectors) => void)): void

function addListener(event: 'PlayerSector', callback: ((login: string, nickname: string, index: number) => void)): void

function addListener(event: 'BestSector' | 'SectorsFetch' | 'PlayerSector',
  callback: ((login: string, nickname: string, index: number, date: Date) => void)
    | ((sectors: MapSectors) => void) | ((sectors: PlayerSectors) => void)): void {
  switch (event) {
    case 'BestSector':
      bestSectorListeners.push(callback as any)
      return
    case 'SectorsFetch':
      fetchListeners.push(callback as any)
      return
    case 'PlayerSector':
      playerSectorListeners.push(callback as any)
      return
  }
}

async function fetchMapSectors(mapId: string): Promise<MapSectors | void>

async function fetchMapSectors(...mapId: string[]): Promise<MapSectors[]>

async function fetchMapSectors(mapIds: string | string[]): Promise<MapSectors | void | MapSectors[]> {
  if (Array.isArray(mapIds)) {
    const str = mapIds.map((a, i) => `mapId=$${i} OR `).join('')
    const res: MapSectors[] | Error = await TM.queryDB(`SELECT * FROM secrecs WHERE ${str.substring(0, str.length - 3)};`, [mapIds])
    if (res instanceof Error) {
      TM.error(`Error when fetching sector records for maps ${mapIds.join(',')}`, res.message)
      return
    } else if (res.length === 1) {
      return res
    }
    return
  }
  const res: MapSectors[] | Error = await TM.queryDB('SELECT * FROM secrecs WHERE mapId=$1;', [mapIds])
  if (res instanceof Error) {
    TM.error(`Error when fetching sector records for map ${mapIds}`, res.message)
    return
  } else if (res.length === 1) {
    return res[0]
  }
}

const sectorRecords = {

  get mapSectors(): ({ login: string, nickname: string, sector: number, date: Date } | null)[] {
    const arr: ({ login: string, nickname: string, sector: number, date: Date } | null)[] = new Array(TM.map.checkpointsAmount).fill(null)
    for (const [i, e] of mapSectors.logins.entries()) {
      arr[i] = { login: e, nickname: mapSectors.nicknames[i], sector: mapSectors.sectors[i], date: mapSectors.dates[i] }
    }
    return arr
  },

  get playerSectors(): ({ login: string, sectors: (number | null)[] })[] {
    const arr: ({ login: string, sectors: (number | null)[] })[] = []
    for (const [i, e] of TM.players.entries()) {
      arr[i] = {
        login: e.login,
        sectors: sectors.find(a => a.login === e.login)?.sectors ?? new Array(TM.map.checkpointsAmount).fill(null)
      }
    }
    return arr
  },

  addListener,

  fetchMapSectors

}

export { sectorRecords }