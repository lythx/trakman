import { DedimaniaClient } from './DedimaniaClient.js'
import { trakman as tm } from '../../src/Trakman.js'
import config from './Config.js'
import { DediRecord, NewDediRecord } from './DedimaniaTypes.js'

// TODO overloads and comments
// TODO detect authentication error and then dont reconnect

let currentDedis: DediRecord[] = []
let newDedis: DediRecord[] = []
const client: DedimaniaClient = new DedimaniaClient()

const recordListeners: ((record: NewDediRecord) => void)[] = []
const fetchListeners: ((dedis: DediRecord[]) => void)[] = []

const emitRecordEvent = (record: NewDediRecord): void => {
  for (const e of recordListeners) { e(record) }
}

const emitFetchEvent = (dedis: DediRecord[]): void => {
  for (const e of fetchListeners) { e(dedis) }
}

const initialize = async (): Promise<void> => {
  const status: true | Error = await client.connect(config.host, config.port)
  if (status instanceof Error) {
    if (status.message !== 'No response from dedimania server') {
      tm.log.error('Failed to connect to dedimania', status.message)
    }
    else {
      tm.log.error(`${status.message}. Attempting to reconnect every ${config.reconnectTimeout} seconds...`)
      void reinitialize()
    }
    return
  }
  updateServerPlayers()
  const current = tm.maps.current
  await getRecords(current.id, current.name, current.environment, current.author)
  tm.log.trace('Connected to Dedimania')
}

const reinitialize = async (): Promise<void> => {
  let status: true | Error
  do {
    await new Promise((resolve) => setTimeout(resolve, 60000))
    status = await client.connect(config.host, config.port)
  } while (status !== true)
  tm.log.info('Initialized dedimania after an error')
  updateServerPlayers()
  const current = tm.maps.current
  await getRecords(current.id, current.name, current.environment, current.author)
}

const getRecords = async (id: string, name: string, environment: string, author: string): Promise<void> => {
  currentDedis.length = 0
  newDedis.length = 0
  if (client.connected === false) {
    let status: boolean | Error = false
    do {
      await new Promise((resolve) => setTimeout(resolve, config.reconnectTimeout * 1000))
      status = await client.connect('dedimania.net', config.port)
      if (id !== tm.maps.current.id) { return }
    } while (status !== true)
  }
  const cfg: ServerInfo = tm.state.serverConfig
  const nextIds: string[] = tm.jukebox.queue.slice(0, 5).map(a => a.id)
  const players = tm.players.list
  const rawDedis: any[] | Error = await client.call('dedimania.CurrentChallenge',
    [
      { string: id },
      { string: name },
      { string: environment },
      { string: author },
      { string: 'TMF' }, // Maybe do cfg.game.toUpperCase().substring(3) :fun:
      { int: tm.state.gameConfig.gameMode },
      {
        struct: {
          SrvName: { string: cfg.name },
          Comment: { string: cfg.comment },
          Private: { boolean: cfg.password === '' },
          SrvIP: { string: '127.0.0.1' }, // Can actually get the real server IP via cfg.ipAddress
          SrvPort: { string: '5000' },
          XmlRpcPort: { string: '5000' },
          NumPlayers: { int: players.filter(a => !a.isSpectator).length },
          MaxPlayers: { int: cfg.currentMaxPlayers },
          NumSpecs: { int: players.filter(a => a.isSpectator).length },
          MaxSpecs: { int: cfg.currentMaxPlayers },
          LadderMode: { int: cfg.currentLadderMode },
          NextFiveUID: { string: nextIds.join('/') }
        }
      },
      { int: config.dediCount },
      { array: getPlayersArray() }
    ])
  if (rawDedis instanceof Error) {
    tm.log.error(`Failed to fetch dedimania records for map ${name} (${id}), reveived error:`, rawDedis.message)
    return
  }
  else if (rawDedis?.[0]?.Records === undefined) {
    tm.log.error(`Failed to fetch dedimania records for map ${name} (${id}), received empty response`)
    return
  }
  currentDedis = rawDedis[0].Records.map((a: any): DediRecord =>
  ({
    login: a.Login, nickname: a.NickName, time: a.Best,
    checkpoints: a.Checks.slice(0, a.Checks.length - 1)
  }))
  emitFetchEvent(currentDedis)
}

const sendRecords = async (mapId: string, name: string, environment: string, author: string, checkpointsAmount: number): Promise<void> => {
  if (client.connected === false) { return }
  if (newDedis.length === 0) { return }
  const recordsArray: any = []
  for (const d of newDedis) {
    recordsArray.push(
      {
        struct: {
          Login: { string: d.login },
          Best: { int: d.time },
          Checks: { string: [...d.checkpoints, d.time].join(',') }
        }
      }
    )
  }
  const status: any[] | Error = await client.call('dedimania.ChallengeRaceTimes',
    [
      { string: mapId },
      { string: name },
      { string: environment },
      { string: author },
      { string: 'TMF' },
      { int: tm.state.gameConfig.gameMode },
      { int: checkpointsAmount },
      { int: config.dediCount },
      { array: recordsArray }
    ]
  )
  if (status instanceof Error) { tm.log.error(`Failed to send dedimania records for map ${tm.utils.strip(name)} (${mapId})`, status.message) }
}

const addRecord = (player: Omit<TMPlayer, 'currentCheckpoints' | 'isSpectator'>,
  time: number, checkpoints: number[]): void => {
  if (client.connected === false) { return }
  const pb: number | undefined = currentDedis.find(a => a.login === player.login)?.time
  const position: number = currentDedis.filter(a => a.time <= time).length + 1
  if (position > config.dediCount || time > (pb ?? Infinity)) { return }
  if (pb === undefined) {
    const dediRecordInfo: NewDediRecord = constructRecordObject(player, checkpoints, time, -1, position, -1)
    currentDedis.splice(position - 1, 0, { login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    newDedis.push({ login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    tm.log.info(getLogString(-1, position, -1, time, player))
    emitRecordEvent(dediRecordInfo)
  } else if (time === pb) {
    const previousPosition: number = currentDedis.findIndex(a => a.login === currentDedis.find(a => a.login === player.login)?.login) + 1
    const dediRecordInfo: NewDediRecord = constructRecordObject(player, checkpoints, time, time, previousPosition, previousPosition)
    tm.log.info(getLogString(previousPosition, previousPosition, time, time, player))
    emitRecordEvent(dediRecordInfo)
  } else if (time < pb) {
    const previousIndex: number = currentDedis.findIndex(a => a.login === currentDedis.find(a => a.login === player.login)?.login)
    const previousTime: number = currentDedis[previousIndex].time
    if (previousTime === undefined) { // not sure if this is needed
      tm.log.error(`Can't find player ${player.login} in memory`)
      return
    }
    const dediRecordInfo: NewDediRecord = constructRecordObject(player, checkpoints, time, previousTime, position, currentDedis.findIndex(a => a.login === player.login) + 1)
    currentDedis = currentDedis.filter(a => a.login !== player.login)
    currentDedis.splice(position - 1, 0, { login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    newDedis = newDedis.filter(a => a.login !== player.login)
    newDedis.push({ login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    tm.log.info(getLogString(previousIndex + 1, position, previousTime, time, player))
    emitRecordEvent(dediRecordInfo)
  }
}

const updateServerPlayers = (): void => {
  setInterval(async (): Promise<void> => {
    if (client.connected === false) { return }
    const cfg: ServerInfo = tm.state.serverConfig
    const nextIds: string[] = tm.jukebox.queue.slice(0, 5).map(a => a.id)
    const players = tm.players.list
    const status: any[] | Error = await client.call('dedimania.UpdateServerPlayers',
      [
        { string: 'TMF' },
        { int: tm.state.gameConfig.gameMode },
        {
          struct: {
            SrvName: { string: cfg.name },
            Comment: { string: cfg.comment },
            Private: { boolean: cfg.password === '' },
            SrvIP: { string: '127.0.0.1' },
            SrvPort: { string: '5000' },
            XmlRpcPort: { string: '5000' },
            NumPlayers: { int: players.filter(a => !a.isSpectator).length },
            MaxPlayers: { int: cfg.currentMaxPlayers },
            NumSpecs: { int: players.filter(a => a.isSpectator).length },
            MaxSpecs: { int: cfg.currentMaxPlayers },
            LadderMode: { int: cfg.currentLadderMode },
            NextFiveUID: { string: nextIds.join('/') }
          }
        },
        { array: getPlayersArray() }
      ]
    )
    if (status instanceof Error) { tm.log.error('Failed to update dedimania status', status.message) }
  }, 240000)
}

/**
 * Updates the player information and server player list on the dedimania website
 * @param player Player object
 */
const playerJoin = async (player: 
  { login: string, nickname: string, region: string, isSpectator: boolean, ladderRank: number }): Promise<void> => {
  if (client.connected === false) { return }
  const status: any[] | Error = await client.call('dedimania.PlayerArrive',
    [
      { string: 'TMF' },
      { string: player.login },
      { string: player.nickname },
      { string: tm.utils.countryToCode(player.region.split('|')[0]) },
      { string: '' }, // TEAMNAME
      { int: player.ladderRank },
      { boolean: player.isSpectator },
      { boolean: false } // OFFICIAL MODE ALWAYS FALSE
    ]
  )
  if (status instanceof Error) { tm.log.error(`Failed to update dedimania player information for ${tm.utils.strip(player.nickname)} (${player.login})`, status.message) }
}

/**
 * Updates the server player list on the dedimania website
 * @param player Player object
 */
const playerLeave = async (player: { login: string, nickname: string }): Promise<void> => {
  if (client.connected === false) { return }
  const status: any[] | Error = await client.call('dedimania.PlayerLeave',
    [
      { string: 'TMF' },
      { string: player.login }
    ])
  if (status instanceof Error) { tm.log.error(`Failed to update player information for ${tm.utils.strip(player.nickname)} (${player.login})`, status.message) }
}

const getPlayersArray = (): any[] => {
  const players: TMPlayer[] = tm.players.list
  let arr: any[] = []
  for (const player of players) {
    arr.push(
      [
        {
          struct: {
            Login: { string: player.login },
            Nation: { string: player.countryCode },
            TeamName: { string: '' },
            TeamId: { int: -1 },
            IsSpec: { boolean: player.isSpectator },
            Ranking: { int:  player.ladderRank }, 
            IsOff: { boolean: false } // OFFICIAL MODE ALWAYS FALSE
          }
        }
      ]
    )
  }
  return arr
}

const constructRecordObject = (player: Omit<TMPlayer, 'currentCheckpoints' | 'isSpectator'>,
  checkpoints: number[], time: number, previousTime: number, position: number, previousPosition: number): NewDediRecord => {
  return {
    ...player,
    time,
    checkpoints,
    position,
    previousTime,
    previousPosition
  }
}

const getLogString = (previousPosition: number, position: number, previousTime: number, time: number, player: { login: string, nickname: string }): string[] => {
  const rs = tm.utils.getRankingString(previousPosition, position, previousTime, time)
  return [`${tm.utils.strip(player.nickname)} (${player.login}) has ${rs.status} the ${tm.utils.getPositionString(position)} dedimania record. Time: ${tm.utils.getTimeString(time)}${rs.difference !== undefined ? rs.difference : ``}`]
}

if (config.isEnabled === true) {

  tm.addListener('Controller.Ready', () => {
    tm.log.trace('Connecting to Dedimania...')
    void initialize()
  }, true)

  tm.addListener('Controller.BeginMap', (info) => {
    void getRecords(info.id, info.name, info.environment, info.author)
  }, true)

  tm.addListener('Controller.EndMap', (info) => {
    void sendRecords(info.id, info.name, info.environment, info.author, info.checkpointsAmount)
  })

  tm.addListener('Controller.PlayerJoin', (info) => {
    void playerJoin(info)
  })

  tm.addListener('Controller.PlayerLeave', (info) => {
    void playerLeave(info)
  })

  tm.addListener('Controller.PlayerFinish', (info) => {
    void addRecord(info, info.time, info.checkpoints)
  }, true)

}

export const dedimania = {

  /**
   * Adds a callback function to execute on a dedimania record
   * @param callback Function to execute on event. It takes new record object as a parameter
   */
  onRecord(callback: ((record: NewDediRecord) => void)): void {
    recordListeners.push(callback)
  },

  /**
   * Adds a callback function to execute when dedimania records get fetched
   * @param callback Function to execute on event. It takes record objects array as a parameter
   */
  onFetch(callback: ((dedis: DediRecord[]) => void)): void {
    fetchListeners.push(callback)
  },

  getRecord(logins: string | string[]) {
    if (typeof logins === 'string') {
      return currentDedis.find(a => a.login === logins)
    }
    return currentDedis.filter(a => logins.includes(a.login))
  },

  getNewRecord(logins: string | string[]) {
    if (typeof logins === 'string') {
      return newDedis.find(a => a.login === logins)
    }
    return newDedis.filter(a => logins.includes(a.login))
  },

  get records(): Readonly<DediRecord>[] {
    return [...currentDedis]
  },

  get newRecords(): Readonly<DediRecord>[] {
    return [...newDedis]
  },

  get recordCount(): number {
    return currentDedis.length
  },

  get newRecordCount(): number {
    return newDedis.length
  },

  get isEnabled(): boolean {
    return config.isEnabled
  },

  get isConnected(): boolean {
    return client.connected
  },

  get maxRecordCount(): number {
    return config.dediCount
  }

}

export { NewDediRecord, DediRecord }