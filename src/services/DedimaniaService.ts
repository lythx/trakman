import { DedimaniaClient } from '../dedimania/DedimaniaClient.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { PlayerService } from './PlayerService.js'
import { GameService } from './GameService.js'
import { ChallengeService } from './ChallengeService.js'
import { Client } from '../Client.js'
import colours from '../data/Colours.json' assert {type: 'json'}
import { ServerConfig } from '../ServerConfig.js'
import { JukeboxService } from './JukeboxService.js'
import { Events } from '../Events.js'

export abstract class DedimaniaService {

  static _dedis: TMDedi[] = []
  static _newDedis: TMDedi[] = []

  static async initialize(): Promise<void> {
    await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT)).catch(err => {
      ErrorHandler.error('Failed to connect to dedimania', err)
      Client.callNoRes('ChatSendServerMessage', [{ string: `${colours.red}Failed to connect to dedimania` }])
    })
    this.updateServerPlayers()
    const challengeDedisInfo = await DedimaniaService.getRecords(ChallengeService.current.id, ChallengeService.current.name, ChallengeService.current.environment, ChallengeService.current.author)
    Events.emitEvent('Controller.DedimaniaRecords', challengeDedisInfo)
    Events.addListener('Controller.EndChallenge', (info: EndChallengeInfo) => {
      this.sendRecords(info)
    })
    Events.addListener('Controller.PlayerFinish', (info: FinishInfo) => {
      this.addRecord(info)
    })
  }

  static get dedis(): TMDedi[] {
    return [...this._dedis]
  }

  static get newDedis(): TMDedi[] {
    return [...this._newDedis]
  }

  static async getRecords(id: string, name: string, environment: string, author: string): Promise<ChallengeDedisInfo> {
    this._dedis.length = 0
    this._newDedis.length = 0
    const cfg = ServerConfig.config
    const nextIds = []
    for (let i = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    const dedis = await DedimaniaClient.call('dedimania.CurrentChallenge',
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
            SrvIP: { string: 'lol' },
            SrvPort: { string: 'lol2' },
            XmlRpcPort: { string: 'lol3' },
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
      ]
    ).catch(err => ErrorHandler.error(`Failed to fetch dedimania records for challenge: ${name}`, err))
    if (dedis == null) { throw new Error('unable to fetch records') }
    for (const d of dedis[0].Records) {
      const record: TMDedi = { login: d.Login, nickName: d.NickName, score: d.Best, checkpoints: d.Checks }
      this._dedis.push(record)
    }
    const temp: any = ChallengeService.current
    temp.dedis = this._dedis
    const challengeDedisInfo: ChallengeDedisInfo = temp
    return challengeDedisInfo
  }

  static async sendRecords(info: EndChallengeInfo): Promise<void> {
    const recordsArray: any = []
    for (const d of this._newDedis) {
      recordsArray.push(
        {
          struct: {
            Login: { string: d.login },
            Best: { int: d.score },
            Checks: { string: [...d.checkpoints, d.score].join(',') }
          }
        }
      )
    }
    const status = await DedimaniaClient.call('system.multicall',
      [{
        array: [
          {
            struct:
            {
              methodName: { string: 'dedimania.ChallengeRaceTimes' },
              params: {
                array: [
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
              }
            }
          },
          {
            struct:
            {
              methodName: { string: 'dedimania.WarningsAndTTR' },
              params: { array: [] }
            }
          },
        ]
      }]
    )
  }

  private static addRecord(info: FinishInfo): void {
    const pb = this._dedis.find(a => a.login === info.login)?.score
    const position = this._dedis.filter(a => a.score <= info.score).length + 1
    if (position > Number(process.env.DEDIS_AMOUNT) || info.score > (pb || Infinity)) { return }
    if (pb == null) {
      const dediRecordInfo: DediRecordInfo = {
        challenge: info.challenge,
        login: info.login,
        score: info.score,
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
        previousScore: -1,
        previousPosition: -1
      }
      this._dedis.splice(position - 1, 0, { login: info.login, score: info.score, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      this._newDedis.push({ login: info.login, score: info.score, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      Events.emitEvent('Controller.DedimaniaRecord', dediRecordInfo)
      return
    }
    if (info.score === pb) {
      const previousPosition = this._dedis.findIndex(a => a.login === this._dedis.find(a => a.login === info.login)?.login) + 1
      const dediRecordInfo: DediRecordInfo = {
        challenge: info.challenge,
        login: info.login,
        score: info.score,
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
        previousScore: info.score,
        previousPosition
      }
      Events.emitEvent('Controller.DedimaniaRecord', dediRecordInfo)
      return
    }
    if (info.score < pb) {
      const previousScore = this._dedis.find(a => a.login === info.login)?.score
      if (previousScore === undefined) {
        ErrorHandler.error(`Can't find player ${info.login} in memory`)
        return
      }
      const dediRecordInfo: DediRecordInfo = {
        challenge: info.challenge,
        login: info.login,
        score: info.score,
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
        previousScore,
        previousPosition: this._dedis.findIndex(a => a.login === info.login) + 1
      }
      this._dedis = this._dedis.filter(a => a.login !== info.login)
      this._dedis.splice(position - 1, 0, { login: info.login, score: info.score, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      this._newDedis = this._newDedis.filter(a => a.login !== info.login)
      this._newDedis.push({ login: info.login, score: info.score, nickName: info.nickName, checkpoints: [...info.checkpoints] })
      Events.emitEvent('Controller.DedimaniaRecord', dediRecordInfo)
    }
  }

  private static updateServerPlayers(): void {
    setInterval(async (): Promise<void> => {
      const cfg = ServerConfig.config
      const nextIds = []
      for (let i = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
      const status = await DedimaniaClient.call('dedimania.UpdateServerPlayers', [
        { string: 'TMF' },
        { int: PlayerService.players.length },
        {
          struct: {
            SrvName: { string: cfg.name },
            Comment: { string: cfg.comment },
            Private: { boolean: cfg.password === '' },
            SrvIP: { string: 'lol' },
            SrvPort: { string: 'lol2' },
            XmlRpcPort: { string: 'lol3' },
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
      ).catch(err => ErrorHandler.error('Error when trying to update dedimania status', err))
      if (status == null) { ErrorHandler.error('Failed to update dedimania status') }
    }, 240000)
  }
}
