'use strict'

import { DedimaniaClient } from '../dedimania/DedimaniaClient.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { PlayerService } from './PlayerService.js'
import { GameService } from './GameService.js'
import { ChallengeService } from './ChallengeService.js'

export abstract class DedimaniaService {
  static _dedis: TMDedi[] = []

  static async initialize (): Promise<void> {
    await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT)).catch(err => {
      ErrorHandler.fatal('Failed to connect to dedimania', err)
    })
    this.updateServerPlayers()
  }

  static get dedis (): TMDedi[] {
    return this._dedis
  }

  static async getRecords (id: string, name: string, environment: string, author: string): Promise<ChallengeDedisInfo> {
    this._dedis.length = 0
    const dedis = await DedimaniaClient.call('dedimania.CurrentChallenge',
      [
        { string: id },
        { string: name },
        { string: environment },
        { string: author },
        { string: 'TMF' },
        { int: GameService.gameMode }, // mode: 1-TA
        {
          struct: {
            SrvName: { string: 'TODO' } // TODO
          }
        },
        { int: 30 }, // number of records probably
        { array: [] } // idk
      ]
    )
      .catch(err => ErrorHandler.error(`Failed to fetch dedimania records for challenge: ${name}`, err))
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

  static async sendRecords (dedi: TMDedi[]): Promise<void> {
    // const status = await DedimaniaClient.call('dedimania.SendRecords',
    //   [
    // { string: id },
    // { string: name },
    // { string: environment },
    // { string: author },
    // { string: 'TMF' },
    // { int: 1 }, // mode: 1-TA
    // {
    //   struct: {
    //     SrvName: { string: 'TODO' } // TODO
    //   }
    // },
    // { int: 30 }, // number of records probably
    // { array: [] } // idk
    //   ]
    // )
    //   .catch(err => ErrorHandler.error(`Failed to send dedimania records`, err))
  }

  private static updateServerPlayers (): void {
    setInterval(async (): Promise<void> => {
      const status = await DedimaniaClient.call('dedimania.UpdateServerPlayers', [
        { string: process.env.SERVER_GAME },
        { int: PlayerService.players.length },
        {
          struct: {
            SrvName: { string: 'TODO' },
            Comment: { string: 'TODO' },
            Private: { boolean: 'TODO' },
            SrvIP: { string: 'TODO' },
            SrvPort: { string: 'TODO' },
            XmlRpcPort: { string: 'TODO' },
            NumPlayers: { int: 'TODO' },
            MaxPlayers: { int: 'TODO' },
            NumSpecs: { int: 'TODO' },
            MaxSpecs: { int: 'TODO' },
            LadderMode: { int: 'TODO' },
            NextFiveUID: { string: ['TODO', 'TODO', 'TODO', 'TODO', 'TODO'].join('/') }
          }
        },
        { array: [] }
      ]
      ).catch(err => ErrorHandler.error('Error when trying to update dedimania status', err))
      if (status == null) { ErrorHandler.error('Failed to update dedimania status') }
    }, 240000)
  }
}
