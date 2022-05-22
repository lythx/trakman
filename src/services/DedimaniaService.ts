'use strict'

import { DedimaniaClient } from '../dedimania/DedimaniaClient.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { PlayerService } from './PlayerService.js'

export abstract class DedimaniaService {
  static _dedis: TMDedi[] = []

  static async initialize (): Promise<void> {
    await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT)).catch(err => {
      ErrorHandler.fatal('Failed to connect to dedimania', err)
    })
    this.updateServerPlayers()
  }

  static get dedis () {
    return this._dedis
  }

  static async getRecords (id: string, name: string, environment: string, author: string): Promise<any[]> {
    const dedis = await DedimaniaClient.call('dedimania.CurrentChallenge',
      [
        { string: id },
        { string: name },
        { string: environment },
        { string: author },
        { string: 'TMF' },
        { int: 1 }, // mode: 1-TA
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
      const record: TMDedi = { login: d.Login, score: d.Best, checkpoints: d.Checks, date: d.date }
      this._dedis.push(record)
    }
    return this._dedis
  }

  static async sendRecords (dedi: TMDedi[]) {
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
            SrvName: { string: 'TODO' } // TODO
          }
        },
        { array: [] }
      ]
      ).catch(err => ErrorHandler.error('Error when trying to update dedimania status', err))
      if (status == null) { ErrorHandler.error('Failed to update dedimania status') }
    }, 240000)
  }
}
