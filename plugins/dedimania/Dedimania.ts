import { DedimaniaClient } from './DedimaniaClient.js'
import { trakman as tm } from '../../src/Trakman.js'
import Config from './Config.js'

let _dedis: TMDedi[] = []
let newDedis: TMDedi[] = []
const client = new DedimaniaClient()

const initialize = async (): Promise<void> => {
  const status: true | Error = await client.connect(Config.host, Config.port)
  if (status instanceof Error) {
    if (status.message !== 'No response from dedimania server') { await tm.log.fatal('Failed to connect to dedimania', status.message) }
    else {
      tm.log.error(`${status.message}. Attempting to reconnect every 60 seconds...`)
      void reinitialize()
    }
  }
  updateServerPlayers()
  const current = tm.maps.current
  await getRecords(current.id, current.name, current.environment, current.author)
}

const reinitialize = async (): Promise<void> => {
  let status: true | Error
  do {
    await new Promise((resolve) => setTimeout(resolve, 60000))
    status = await client.connect('dedimania.net', Config.port)
  } while (status !== true)
  tm.log.info('Initialized dedimania service after an error')
  updateServerPlayers()
  const current = tm.maps.current
  await getRecords(current.id, current.name, current.environment, current.author)
}

const getRecords = async (id: string, name: string, environment: string, author: string): Promise<true | Error> => {
  if (Config.enabled === false) { return new Error('Dedimania is not enabled') }
  _dedis.length = 0
  newDedis.length = 0
  if (client.connected === false) {
    let status: boolean | Error = false
    do {
      await new Promise((resolve) => setTimeout(resolve, 60000))
      status = await client.connect('dedimania.net', Config.port)
      if (id !== tm.maps.current.id) { return new Error(`Failed to connect to dedimania`) }
    } while (status !== true)
  }
  const cfg: ServerInfo = tm.state.serverConfig
  const nextIds: string[] = tm.jukebox.queue.slice(0, 5).map(a => a.id)
  const players = tm.players.list
  const dedis: any[] | Error = await client.call('dedimania.CurrentChallenge',
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
      { int: Config.dediCount },
      { array: getPlayersArray() }
    ])
  if (dedis instanceof Error) {
    return dedis
  }
  else if (dedis?.[0]?.Records === undefined) {
    return new Error(`Failed to fetch records`)
  }
  for (const d of dedis[0].Records) {
    const record: TMDedi = { login: d.Login, nickname: d.NickName, time: d.Best, checkpoints: d.Checks.slice(0, d.Checks.length - 1) }
    _dedis.push(record)
  }
  const temp: any = tm.maps.current
  temp.dedis = _dedis
  const mapDedisInfo: MapDedisInfo = temp
  //Events.emitEvent('Controller.DedimaniaRecords', mapDedisInfo)
  return true
}

const sendRecords = async (mapId: string, name: string, environment: string, author: string, checkpointsAmount: number): Promise<true | Error> => {
  if (Config.enabled === false) { return new Error('Dedimania is not enabled') }
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
      { int: Config.dediCount },
      { array: recordsArray }
    ]
  )
  if (status instanceof Error) { tm.log.error(`Failed to send dedimania records for map ${tm.utils.strip(name)} (${mapId})`, status.message) }
  return true
}

const addRecord = (mapId: string, player: TMPlayer, time: number, checkpoints: number[]): false | Error | DediRecordInfo => {
  if (Config.enabled === false) { return new Error('Dedimania service is not enabled') }
  const pb: number | undefined = _dedis.find(a => a.login === player.login)?.time
  const position: number = _dedis.filter(a => a.time <= time).length + 1
  if (position > Config.dediCount || time > (pb ?? Infinity)) { return false }
  if (pb === undefined) {
    const dediRecordInfo: DediRecordInfo = constructRecordObject(player, mapId, checkpoints, time, -1, position, -1)
    _dedis.splice(position - 1, 0, { login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    newDedis.push({ login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    tm.log.info(getLogString(-1, position, -1, time, player))
    return dediRecordInfo
  }
  if (time === pb) {
    const previousPosition: number = _dedis.findIndex(a => a.login === _dedis.find(a => a.login === player.login)?.login) + 1
    const dediRecordInfo: DediRecordInfo = constructRecordObject(player, mapId, checkpoints, time, time, previousPosition, previousPosition)
    tm.log.info(getLogString(previousPosition, previousPosition, time, time, player))
    return dediRecordInfo
  }
  if (time < pb) {
    const previousIndex: number = _dedis.findIndex(a => a.login === _dedis.find(a => a.login === player.login)?.login)
    const previousTime: number = _dedis[previousIndex].time
    if (previousTime === undefined) {
      tm.log.error(`Can't find player ${player.login} in memory`)
      return new Error(`Can't find player ${player.login} in memory`)
    }
    const dediRecordInfo: DediRecordInfo = constructRecordObject(player, mapId, checkpoints, time, previousTime, position, _dedis.findIndex(a => a.login === player.login) + 1)
    _dedis = _dedis.filter(a => a.login !== player.login)
    _dedis.splice(position - 1, 0, { login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    newDedis = newDedis.filter(a => a.login !== player.login)
    newDedis.push({ login: player.login, time: time, nickname: player.nickname, checkpoints: [...checkpoints] })
    tm.log.info(getLogString(previousIndex + 1, position, previousTime, time, player))
    return dediRecordInfo
  }
  return false
}

const updateServerPlayers = (): void => {
  setInterval(async (): Promise<void> => {
    const cfg: ServerInfo = tm.state.serverConfig
    const nextIds: string[] = tm.jukebox.queue.slice(0, 5).map(a => a.id)
    const players = tm.players.list
    const status: any[] | Error = await client.call('dedimania.UpdateServerPlayers',
      [
        { string: 'TMF' },
        { int: players.length },
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

const playerJoin = async (player: { login: string, nickname: string, region: string, isSpectator: boolean }): Promise<void> => {
  if (Config.enabled === false) { return }
  const status: any[] | Error = await client.call('dedimania.PlayerArrive',
    [
      { string: 'TMF' },
      { string: player.login },
      { string: player.nickname },
      { string: player.region },
      { string: '' }, // TEAMNAME
      { int: 0 }, // TODO: PLAYER LADDER RANK
      { boolean: player.isSpectator },
      { boolean: false } // OFFICIAL MODE ALWAYS FALSE
    ]
  )
  if (status instanceof Error) { tm.log.error(`Failed to update dedimania player information for ${tm.utils.strip(player.nickname)} (${player.login})`, status.message) }
}

const playerLeave = async (player: { login: string, nickname: string }): Promise<void> => {
  if (Config.enabled === false) { return }
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
            Ranking: { int: 0 }, // TODO PLAYER LADDER RANKING
            IsOff: { boolean: false } // OFFICIAL MODE ALWAYS FALSE
          }
        }
      ]
    )
  }
  return arr
}

const constructRecordObject = (player: TMPlayer, mapId: string,
  checkpoints: number[], time: number, previousTime: number, position: number, previousPosition: number): DediRecordInfo => {
  return {
    map: mapId,
    login: player.login,
    time,
    checkpoints,
    nickname: player.nickname,
    country: player.country,
    countryCode: player.countryCode,
    timePlayed: player.timePlayed,
    joinTimestamp: player.joinTimestamp,
    wins: player.wins,
    privilege: player.privilege,
    visits: player.visits,
    position,
    previousTime,
    previousPosition,
    playerId: player.id,
    ip: player.ip,
    region: player.region,
    isUnited: player.isUnited
  }
}

const getLogString = (previousPosition: number, position: number, previousTime: number, time: number, player: { login: string, nickname: string }): string[] => {
  const rs = tm.utils.getRankingString(previousPosition, position, previousTime, time)
  return [`${tm.utils.strip(player.nickname)} (${player.login}) has ${rs.status} the ${tm.utils.getPositionString(position)} dedimania record. Time: ${tm.utils.getTimeString(time)}${rs.difference !== undefined ? rs.difference : ``}`]
}
