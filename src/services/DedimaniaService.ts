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
  }

  static get dedis(): TMDedi[] {
    return [...this._dedis]
  }

  static async getRecords(id: string, name: string, environment: string, author: string): Promise<ChallengeDedisInfo> {
    this._dedis.length = 0
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
    return
    const cfg = ServerConfig.config
    const nextIds = []
    for (let i = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    const status = await DedimaniaClient.call('dedimania.UpdateServerPlayers', [
      { string: info.id },
      { string: info.name },
      { string: info.environment },
      { string: info.author },
      { string: 'TMF' },
      { int: GameService.gameMode },
      { int: info.checkpointsAmount },
      { int: process.env.DEDIS_AMOUNT },
      //{ array: [] } //TIMES TODO
    ]
    )
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
