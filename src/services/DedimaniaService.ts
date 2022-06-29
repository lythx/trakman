import { DedimaniaClient } from '../dedimania/DedimaniaClient.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { PlayerService } from './PlayerService.js'
import { GameService } from './GameService.js'
import { MapService } from './MapService.js'
import { Client } from '../Client.js'
import colours from '../data/Colours.json' assert {type: 'json'}
import { ServerConfig } from '../ServerConfig.js'
import { JukeboxService } from './JukeboxService.js'
import { Events } from '../Events.js'

export abstract class DedimaniaService {

  static _dedis: TMDedi[] = []
  static _newDedis: TMDedi[] = []

  static async initialize(): Promise<void | Error> {
    const status: void | Error = await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT))
    if (status instanceof Error) {
      if (status.message !== 'No response from dedimania server') { ErrorHandler.fatal('Failed to connect to dedimania', status.message) }
      return status
    }
    this.updateServerPlayers()
    const mapDedisInfo: void | Error = await DedimaniaService.getRecords(MapService.current.id, MapService.current.name, MapService.current.environment, MapService.current.author)
    Events.emitEvent('Controller.DedimaniaRecords', mapDedisInfo)
    Events.addListener('Controller.EndMap', (info: EndMapInfo): void => {
      this.sendRecords(info)
    })
    Events.addListener('Controller.PlayerFinish', (info: FinishInfo): void => {
      console.log(info)
      console.log('===========')
      this.addRecord(info)
    })
  }

  static get dedis(): TMDedi[] {
    return [...this._dedis]
  }

  static get newDedis(): TMDedi[] {
    return [...this._newDedis]
  }

  static async getRecords(id: string, name: string, environment: string, author: string, isRetry: boolean = false): Promise<void | Error> {
    this._dedis.length = 0
    this._newDedis.length = 0
    const cfg: ServerInfo = ServerConfig.config
    const nextIds: any[] = []
    for (let i: number = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    const dedis: any[] | Error = await DedimaniaClient.call('dedimania.CurrentChallenge',
      [
        { string: id },
        { string: name },
        { string: environment },
        { string: author },
        { string: 'TMF' },
        { int: GameService.gameMode },
        {
          struct: {
            SrvName: { string: cfg.name },
            Comment: { string: cfg.comment },
            Private: { boolean: cfg.password === '' },
            SrvIP: { string: '127.0.0.1' },
            SrvPort: { string: '5000' },
            XmlRpcPort: { string: '5000' },
            NumPlayers: { int: PlayerService.players.filter(a => a.isSpectator).length },
            MaxPlayers: { int: cfg.currentMaxPlayers },
            NumSpecs: { int: PlayerService.players.filter(a => !a.isSpectator).length },
            MaxSpecs: { int: cfg.currentMaxPlayers },
            LadderMode: { int: cfg.currentLadderMode },
            NextFiveUID: { string: nextIds.join('/') }
          }
        },
        { int: process.env.DEDIS_AMOUNT },
        { array: [] } // idk
      ])
    if (dedis instanceof Error) {
      this.retryGetRecords(id, name, environment, author, isRetry)
      return dedis
    }
    else if (dedis?.[0]?.Records === undefined) {
      this.retryGetRecords(id, name, environment, author, isRetry)
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
  }

  private static async retryGetRecords(id: string, name: string, environment: string, author: string, isRetry: boolean): Promise<void> {
    if (isRetry) { return }
    await new Promise((resolve) => setTimeout(resolve, 1000)) // make it display the warning after controller ready if it doesnt work on start
    ErrorHandler.error(`Failed to fetch dedimania records for map: ${name}`)
    Client.callNoRes('ChatSendServerMessage', [{ string: `${colours.red}Failed to fetch dedimania records, attempting to fetch again...` }])
    let status
    do {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      if (MapService.current.id === id) { status = await this.getRecords(id, name, environment, author, true) }
      else { return }
    } while (status instanceof Error)
  }

  static async sendRecords(info: EndMapInfo): Promise<void> {
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
        { string: info.id },
        { string: info.name },
        { string: info.environment },
        { string: info.author },
        { string: 'TMF' },
        { int: GameService.gameMode },
        { int: info.checkpointsAmount },
        { int: process.env.DEDIS_AMOUNT },
        { array: recordsArray }
      ]
    )
    if (status instanceof Error) { ErrorHandler.error(`Failed to send dedimania records for map ${info.name}`, status.message) }
  }

  private static addRecord(info: FinishInfo): void {
    const pb: number | undefined = this._dedis.find(a => a.login === info.login)?.time
    const position: number = this._dedis.filter(a => a.time <= info.time).length + 1
    if (position > Number(process.env.DEDIS_AMOUNT) || info.time > (pb || Infinity)) { return }
    if (pb === undefined) {
      const dediRecordInfo: DediRecordInfo = {
        map: info.map,
        login: info.login,
        time: info.time,
        checkpoints: info.checkpoints,
        nickName: info.nickName,
        nation: info.nation,
        nationCode: info.nationCode,
        timePlayed: info.timePlayed,
        joinTimestamp: info.joinTimestamp,
        wins: info.wins,
        privilege: info.privilege,
        visits: info.visits,
        position,
        previousTime: -1,
        previousPosition: -1,
        playerId: info.playerId,
        ip: info.ip,
        region: info.region,
        isUnited: info.isUnited
      }
      this._dedis.splice(position - 1, 0, { login: info.login, time: info.time, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      this._newDedis.push({ login: info.login, time: info.time, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      Events.emitEvent('Controller.DedimaniaRecord', dediRecordInfo)
      return
    }
    if (info.time === pb) {
      const previousPosition: number = this._dedis.findIndex(a => a.login === this._dedis.find(a => a.login === info.login)?.login) + 1
      const dediRecordInfo: DediRecordInfo = {
        map: info.map,
        login: info.login,
        time: info.time,
        checkpoints: info.checkpoints,
        nickName: info.nickName,
        nation: info.nation,
        nationCode: info.nationCode,
        timePlayed: info.timePlayed,
        joinTimestamp: info.joinTimestamp,
        wins: info.wins,
        privilege: info.privilege,
        visits: info.visits,
        position: previousPosition,
        previousTime: info.time,
        previousPosition,
        playerId: info.playerId,
        ip: info.ip,
        region: info.region,
        isUnited: info.isUnited
      }
      Events.emitEvent('Controller.DedimaniaRecord', dediRecordInfo)
      return
    }
    if (info.time < pb) {
      const previousTime: number | undefined = this._dedis.find(a => a.login === info.login)?.time
      if (previousTime === undefined) {
        ErrorHandler.error(`Can't find player ${info.login} in memory`)
        return
      }
      const dediRecordInfo: DediRecordInfo = {
        map: info.map,
        login: info.login,
        time: info.time,
        checkpoints: info.checkpoints,
        nickName: info.nickName,
        nation: info.nation,
        nationCode: info.nationCode,
        timePlayed: info.timePlayed,
        joinTimestamp: info.joinTimestamp,
        wins: info.wins,
        privilege: info.privilege,
        visits: info.visits,
        position,
        previousTime: previousTime,
        previousPosition: this._dedis.findIndex(a => a.login === info.login) + 1,
        playerId: info.playerId,
        ip: info.ip,
        region: info.region,
        isUnited: info.isUnited
      }
      this._dedis = this._dedis.filter(a => a.login !== info.login)
      this._dedis.splice(position - 1, 0, { login: info.login, time: info.time, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      this._newDedis = this._newDedis.filter(a => a.login !== info.login)
      this._newDedis.push({ login: info.login, time: info.time, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      Events.emitEvent('Controller.DedimaniaRecord', dediRecordInfo)
    }
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
              NumPlayers: { int: PlayerService.players.filter(a => a.isSpectator).length },
              MaxPlayers: { int: cfg.currentMaxPlayers },
              NumSpecs: { int: PlayerService.players.filter(a => !a.isSpectator).length },
              MaxSpecs: { int: cfg.currentMaxPlayers },
              LadderMode: { int: cfg.currentLadderMode },
              NextFiveUID: { string: nextIds.join('/') }
            }
          },
          { array: [] }
        ]
      )
      if (status instanceof Error) { ErrorHandler.error('Failed to update dedimania status', status.message) }
    }, 240000)
  }
}
