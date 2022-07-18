import { DedimaniaClient } from '../dedimania/DedimaniaClient.js'
import 'dotenv/config'
import { PlayerService } from './PlayerService.js'
import { GameService } from './GameService.js'
import { MapService } from './MapService.js'
import { Client } from '../client/Client.js'
import colours from '../data/Colours.json' assert {type: 'json'}
import { ServerConfig } from '../ServerConfig.js'
import { JukeboxService } from './JukeboxService.js'
import { Events } from '../Events.js'
import { Logger } from '../Logger.js'

export abstract class DedimaniaService {

  static _dedis: TMDedi[] = []
  static _newDedis: TMDedi[] = []
  private static readonly dedisAmount = Number(process.env.DEDIS_AMOUNT)
  private static readonly isActive = process.env.USE_DEDIMANIA === 'YES'

  static async initialize(): Promise<true | Error> {
    if (this.isActive === false) { return new Error('Dedimania service is not enabled. Set USE_DEDIMANIA to yes in .env file to enable it') }
    if (this.dedisAmount === NaN) { await Logger.fatal('DEDIS_AMOUNT is undefined or not a number. Check your .env file') }
    const status: true | Error = await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT))
    if (status instanceof Error) {
      if (status.message !== 'No response from dedimania server') { await Logger.fatal('Failed to connect to dedimania', status.message) }
      else {
        Logger.error(`${status.message}. Attempting to reconnect every 60 seconds...`)
        void this.reinitialize()
      }
      return status
    }
    this.updateServerPlayers()
    await this.getRecords(MapService.current.id, MapService.current.name, MapService.current.environment, MapService.current.author)
    return true
  }

  private static async reinitialize(): Promise<void> {
    let status: true | Error
    do {
      await new Promise((resolve) => setTimeout(resolve, 60000))
      status = await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT))
    } while (status !== true)
    Logger.info('Initialized dedimania service after an error')
    this.updateServerPlayers()
    await this.getRecords(MapService.current.id, MapService.current.name, MapService.current.environment, MapService.current.author)
  }

  static get dedis(): TMDedi[] {
    return [...this._dedis]
  }

  static get newDedis(): TMDedi[] {
    return [...this._newDedis]
  }

  static async getRecords(id: string, name: string, environment: string, author: string): Promise<true | Error> {
    if(this.isActive === false) { return new Error('Dedimania service is not enabled. Set USE_DEDIMANIA to yes in .env file to enable it')}
    this._dedis.length = 0
    this._newDedis.length = 0
    const cfg: ServerInfo = ServerConfig.config
    const nextIds: string[] = []
    for (let i: number = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    const dedis: any[] | Error = await DedimaniaClient.call('dedimania.CurrentChallenge',
      [
        { string: id },
        { string: name },
        { string: environment },
        { string: author },
        { string: 'TMF' },
        { int: GameService.game.gameMode },
        {
          struct: {
            SrvName: { string: cfg.name },
            Comment: { string: cfg.comment },
            Private: { boolean: cfg.password === '' },
            SrvIP: { string: '127.0.0.1' },
            SrvPort: { string: '5000' },
            XmlRpcPort: { string: '5000' },
            NumPlayers: { int: PlayerService.players.filter(a => !a.isSpectator).length },
            MaxPlayers: { int: cfg.currentMaxPlayers },
            NumSpecs: { int: PlayerService.players.filter(a => a.isSpectator).length },
            MaxSpecs: { int: cfg.currentMaxPlayers },
            LadderMode: { int: cfg.currentLadderMode },
            NextFiveUID: { string: nextIds.join('/') }
          }
        },
        { int: this.dedisAmount },
        { array: this.getPlayersArray() }
      ])
    if (dedis instanceof Error) {
      return dedis
    }
    else if (dedis?.[0]?.Records === undefined) {
      return new Error(`Failed to fetch records`)
    }
    for (const d of dedis[0].Records) {
      const record: TMDedi = { login: d.Login, nickName: d.NickName, time: d.Best, checkpoints: d.Checks.slice(0, d.Checks.length - 1) }
      this._dedis.push(record)
    }
    const temp: any = MapService.current
    temp.dedis = this._dedis
    const mapDedisInfo: MapDedisInfo = temp
    Events.emitEvent('Controller.DedimaniaRecords', mapDedisInfo)
    return true
  }

  private static async retryGetRecords(id: string, name: string, environment: string, author: string, isRetry: boolean): Promise<void> {
    if (isRetry) { return }
    await new Promise((resolve) => setTimeout(resolve, 1000)) // make it display the warning after controller ready if it doesnt work on start
    Logger.error(`Failed to fetch dedimania records for map: ${name}`)
    Client.callNoRes('ChatSendServerMessage', [{ string: `${colours.red}Failed to fetch dedimania records, attempting to fetch again...` }])
    let status
    do {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      if (MapService.current.id === id) { status = await this.getRecords(id, name, environment, author) }
      else { return }
    } while (status instanceof Error)
  }

  static async sendRecords(mapId: string, name: string, environment: string, author: string, checkpointsAmount: number): Promise<true | Error> {
    if(this.isActive === false) { return new Error('Dedimania service is not enabled. Set USE_DEDIMANIA to yes in .env file to enable it')}
    const recordsArray: any = []
    for (const d of this._newDedis) {
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
    const status: any[] | Error = await DedimaniaClient.call('dedimania.ChallengeRaceTimes',
      [
        { string: mapId },
        { string: name },
        { string: environment },
        { string: author },
        { string: 'TMF' },
        { int: GameService.game.gameMode },
        { int: checkpointsAmount },
        { int: this.dedisAmount },
        { array: recordsArray }
      ]
    )
    if (status instanceof Error) { Logger.error(`Failed to send dedimania records for map ${name}`, status.message) }
    return true
  }

  static addRecord(mapId: string, player: TMPlayer, time: number, checkpoints: number[]): false | Error | DediRecordInfo {
    if(this.isActive === false) { return new Error('Dedimania service is not enabled. Set USE_DEDIMANIA to yes in .env file to enable it')}
    const pb: number | undefined = this._dedis.find(a => a.login === player.login)?.time
    const position: number = this._dedis.filter(a => a.time <= time).length + 1
    if (position > this.dedisAmount || time > (pb ?? Infinity)) { return false }
    if (pb === undefined) {
      const dediRecordInfo = this.constructRecordObject(player, mapId, checkpoints, time, -1, position, -1)
      this._dedis.splice(position - 1, 0, { login: player.login, time: time, nickName: player.nickName, checkpoints: [...checkpoints] })
      this._newDedis.push({ login: player.login, time: time, nickName: player.nickName, checkpoints: [...checkpoints] })
      return dediRecordInfo
    }
    if (time === pb) {
      const previousPosition: number = this._dedis.findIndex(a => a.login === this._dedis.find(a => a.login === player.login)?.login) + 1
      const dediRecordInfo: DediRecordInfo = this.constructRecordObject(player, mapId, checkpoints, time, time, position, previousPosition)
      return dediRecordInfo
    }
    if (time < pb) {
      const previousTime: number | undefined = this._dedis.find(a => a.login === player.login)?.time
      if (previousTime === undefined) {
        Logger.error(`Can't find player ${player.login} in memory`)
        return new Error(`Can't find player ${player.login} in memory`)
      }
      const dediRecordInfo: DediRecordInfo = this.constructRecordObject(player, mapId, checkpoints, time, previousTime, position, this._dedis.findIndex(a => a.login === player.login) + 1)
      this._dedis = this._dedis.filter(a => a.login !== player.login)
      this._dedis.splice(position - 1, 0, { login: player.login, time: time, nickName: player.nickName, checkpoints: [...checkpoints] })
      this._newDedis = this._newDedis.filter(a => a.login !== player.login)
      this._newDedis.push({ login: player.login, time: time, nickName: player.nickName, checkpoints: [...checkpoints] })
      return dediRecordInfo
    }
    return false
  }

  private static updateServerPlayers(): void {
    setInterval(async (): Promise<void> => {
      const cfg: ServerInfo = ServerConfig.config
      const nextIds: any[] = []
      for (let i: number = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
      const status: any[] | Error = await DedimaniaClient.call('dedimania.UpdateServerPlayers',
        [
          { string: 'TMF' },
          { int: PlayerService.players.length },
          {
            struct: {
              SrvName: { string: cfg.name },
              Comment: { string: cfg.comment },
              Private: { boolean: cfg.password === '' },
              SrvIP: { string: '127.0.0.1' },
              SrvPort: { string: '5000' },
              XmlRpcPort: { string: '5000' },
              NumPlayers: { int: PlayerService.players.filter(a => !a.isSpectator).length },
              MaxPlayers: { int: cfg.currentMaxPlayers },
              NumSpecs: { int: PlayerService.players.filter(a => a.isSpectator).length },
              MaxSpecs: { int: cfg.currentMaxPlayers },
              LadderMode: { int: cfg.currentLadderMode },
              NextFiveUID: { string: nextIds.join('/') }
            }
          },
          { array: this.getPlayersArray() }
        ]
      )
      if (status instanceof Error) { Logger.error('Failed to update dedimania status', status.message) }
    }, 240000)
  }

  static async playerJoin(login: string, nickname: string, region: string, isSpectator: boolean): Promise<void> {
    const status: any[] | Error = await DedimaniaClient.call('dedimania.PlayerArrive',
      [
        { string: 'TMF' },
        { string: login },
        { string: nickname },
        { string: region },
        { string: '' }, // TEAMNAME
        { int: 0 }, // TODO: PLAYER LADDER RANK
        { boolean: isSpectator },
        { boolean: false } // OFFICIAL MODE ALWAYS FALSE
      ]
    )
    if (status instanceof Error) { Logger.error(`Failed to update dedimania player information for ${login}`, status.message) }
  }

  static async playerLeave(login: string): Promise<void> {
    const status: any[] | Error = await DedimaniaClient.call('dedimania.PlayerLeave',
      [
        { string: 'TMF' },
        { string: login }
      ])
    if (status instanceof Error) { Logger.error(`Failed to update player information for ${login}`, status.message) }
  }

  private static getPlayersArray(): any[] {
    const players: TMPlayer[] = PlayerService.players
    let arr: any[] = []
    for (const player of players) {
      arr.push(
        [
          {
            struct: {
              Login: { string: player.login },
              Nation: { string: player.nationCode },
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

  private static constructRecordObject(player: TMPlayer, mapId: string, 
    checkpoints: number[], time: number, previousTime: number, position: number, previousPosition: number): DediRecordInfo {
    return {
      map: mapId,
      login: player.login,
      time,
      checkpoints,
      nickName: player.nickName,
      nation: player.nation,
      nationCode: player.nationCode,
      timePlayed: player.timePlayed,
      joinTimestamp: player.joinTimestamp,
      wins: player.wins,
      privilege: player.privilege,
      visits: player.visits,
      position,
      previousTime,
      previousPosition,
      playerId: player.playerId,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited
    }
  }

}
