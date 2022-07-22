import { TRAKMAN as TM } from '../src/Trakman.js'

interface MapCps {
  readonly mapid: string
  readonly logins: string[]
  readonly nicknames: string[]
  readonly checkpoints: number[]
  readonly dates: Date[]
}

interface PlayerCps {
  readonly mapid: string
  readonly login: string
  readonly checkpoints: number[]
}

const createQueries = [`CREATE TABLE IF NOT EXISTS mapcprecs(
  mapId VARCHAR(27) NOT NULL,
  logins VARCHAR(25)[],
  nicknames VARCHAR(45)[],
  checkpoints INT4[],
  dates TIMESTAMP[],
  PRIMARY KEY(mapId)
);`,
  `CREATE TABLE IF NOT EXISTS cprecs(
  mapId VARCHAR(27) NOT NULL,
  login VARCHAR(25),
  checkpoints INT4[],
  PRIMARY KEY(mapId, login)
);`]

let mapCheckpoints: MapCps

const checkpoints: PlayerCps[] = []

const fetchListeners: ((mapCheckpoints: MapCps, playerCheckpoints: PlayerCps[]) => void)[] = []

const bestCpListeners: ((login: string, nickname: string, index: number, date: Date) => void)[] = []

const playerCpListeners: ((login: string, nickname: string, index: number) => void)[] = []

const addMapCps = async (): Promise<void> => {
  const query = `INSERT INTO mapcprecs(mapId, logins, nicknames, checkpoints, dates) VALUES($1, $2, $3, $4, $5);`
  await TM.queryDB(query, [mapCheckpoints.mapid, mapCheckpoints.logins, mapCheckpoints.nicknames, mapCheckpoints.checkpoints, mapCheckpoints.dates])
}

const addPlayerCp = async (mapId: string, login: string, cps: number[]): Promise<void> => {
  const query = `INSERT INTO cprecs(mapId, login, checkpoints) VALUES($1, $2, $3);`
  await TM.queryDB(query, [mapId, login, cps])
}

const getMapCps = async (mapId: string): Promise<void> => {
  const res: MapCps[] | Error = await TM.queryDB('SELECT * FROM mapcprecs WHERE mapId=$1;', [mapId])
  if (res instanceof Error) {
    TM.error(`Error when fetching checkpoint records on map ${mapId}`, res.message)
    return
  }
  if (res[0] === undefined) {
    mapCheckpoints = { mapid: mapId, logins: [], nicknames: [], checkpoints: [], dates: [] }
    void addMapCps()
  } else {
    console.log('a')
    console.log(res[0])
    mapCheckpoints = res[0]
    console.log(mapCheckpoints)
  }
}

const getPlayerCps = async (mapId: string, login: string): Promise<PlayerCps | undefined> => {
  const res: PlayerCps[] | Error = await TM.queryDB('SELECT * FROM cprecs WHERE mapId=$1 AND login=$2;', [mapId, login])
  if (res instanceof Error) {
    TM.error(`Error when fetching checkpoint records of ${login} on map ${mapId}`, res.message)
    return
  }
  return res[0]
}

const updateMapCps = async (): Promise<void> => {
  const query = `UPDATE mapcprecs SET logins=$1, nicknames=$2, checkpoints=$3, dates=$4 WHERE mapId=$5;`
  const res: MapCps[] | Error = await TM.queryDB(query, [mapCheckpoints.logins, mapCheckpoints.nicknames, mapCheckpoints.checkpoints, mapCheckpoints.dates, mapCheckpoints.mapid])
  if (res instanceof Error) {
    TM.error(`Error when updating checkpoint records`, res.message)
  }
}

const updatePlayerCps = async (mapId: string, login: string, cps: number[]): Promise<void> => {
  const query = `UPDATE cprecs SET checkpoints=$1 WHERE mapId=$2 AND login=$3;`
  const res: MapCps[] | Error = await TM.queryDB(query, [cps, mapId, login])
  if (res instanceof Error) {
    TM.error(`Error when updating checkpoint records for player ${login}`, res.message)
  }
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  for (const query of createQueries) {
    await TM.queryDB(query)
  }
  void getMapCps(TM.map.id)
  for (const e of TM.players) {
    const cps = await getPlayerCps(TM.map.id, e.login)
    if (cps !== undefined) { checkpoints.push(cps) }
  }
  for (const e of fetchListeners) {
    e(mapCheckpoints, checkpoints)
  }
}, true)

TM.addListener('Controller.BeginMap', (info: BeginMapInfo): void => {
  void getMapCps(info.id)
  checkpoints.length = 0
  for (const e of TM.players) {
    const cps = void getPlayerCps(TM.map.id, e.login)
    if (cps !== undefined) { checkpoints.push(cps) }
  }
  for (const e of fetchListeners) {
    e(mapCheckpoints, checkpoints)
  }
}, true)

TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
  const date = new Date()
  const playerCps = checkpoints.find(a => a.login === info.player.login)
  if (playerCps === undefined) {
    checkpoints.push({ mapid: mapCheckpoints.mapid, login: info.player.login, checkpoints: [info.time] })
    void addPlayerCp(mapCheckpoints.mapid, info.player.login, [info.time])
  } else if (playerCps.checkpoints[info.index] === undefined || playerCps.checkpoints[info.index] > info.time) {
    playerCps.checkpoints[info.index] = info.time
    void updatePlayerCps(mapCheckpoints.mapid, info.player.login, playerCps.checkpoints)
  }
  const cp = mapCheckpoints.checkpoints[info.index]
  if (cp === undefined || cp > info.time) {
    mapCheckpoints.logins[info.index] = info.player.login
    mapCheckpoints.nicknames[info.index] = info.player.nickname
    mapCheckpoints.checkpoints[info.index] = info.time
    mapCheckpoints.dates[info.index] = date
    void updateMapCps()
    for (const e of bestCpListeners) {
      e(info.player.login, info.player.nickname, info.index, date)
    }
  }
})

function addListener(event: 'BestCheckpoint', callback: ((login: string, nickname: string, index: number, date: Date) => void)): void

function addListener(event: 'CheckpointsFetch', callback: ((checkpoints: MapCps) => void)): void

function addListener(event: 'PlayerCheckpoint', callback: ((login: string, nickname: string, index: number) => void)): void

function addListener(event: 'BestCheckpoint' | 'CheckpointsFetch' | 'PlayerCheckpoint',
  callback: ((login: string, nickname: string, index: number, date: Date) => void)
    | ((cps: MapCps) => void) | ((cps: PlayerCps) => void)): void {
  switch (event) {
    case 'BestCheckpoint':
      bestCpListeners.push(callback as any)
      return
    case 'CheckpointsFetch':
      fetchListeners.push(callback as any)
      return
    case 'PlayerCheckpoint':
      playerCpListeners.push(callback as any)
      return
  }
}

async function fetchMapCheckpoints(mapId: string): Promise<MapCps | void>

async function fetchMapCheckpoints(...mapId: string[]): Promise<MapCps[]>

async function fetchMapCheckpoints(mapIds: string | string[]): Promise<MapCps | void | MapCps[]> {
  if (Array.isArray(mapIds)) {
    const str = mapIds.map((a, i) => `mapId=$${i} OR `).join('')
    const res: MapCps[] | Error = await TM.queryDB(`SELECT * FROM cprecs WHERE ${str.substring(0, str.length - 3)};`, [mapIds])
    if (res instanceof Error) {
      TM.error(`Error when fetching checkpoint records for maps ${mapIds.join(',')}`, res.message)
      return
    } else if (res.length === 1) {
      return res
    }
    return
  }
  const res: MapCps[] | Error = await TM.queryDB('SELECT * FROM cprecs WHERE mapId=$1;', [mapIds])
  if (res instanceof Error) {
    TM.error(`Error when fetching checkpoint records for map ${mapIds}`, res.message)
    return
  } else if (res.length === 1) {
    return res[0]
  }
}

const checkpointRecords = {

  get mapCheckpoints(): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] {
    const arr: ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] = new Array(TM.map.checkpointsAmount - 1).fill(null)
    for (const [i, e] of mapCheckpoints.logins.entries()) {
      arr[i] = { login: e, nickname: mapCheckpoints.nicknames[i], checkpoint: mapCheckpoints.checkpoints[i], date: mapCheckpoints.dates[i] }
    }
    return arr
  },

  get playerCheckpoints(): ({ login: string, checkpoints: (number | null)[] })[] {
    const arr: ({ login: string, checkpoints: (number | null)[] })[] = []
    for (const [i, e] of TM.players.entries()) {
      arr[i] = {
        login: e.login,
        checkpoints: new Array(TM.map.checkpointsAmount - 1).fill(null).map((a, i) => checkpoints.find(a => a.login === e.login)?.checkpoints[i] ?? null)
      }
    }
    return arr
  },

  addListener,

  fetchMapCheckpoints

}

export { checkpointRecords }