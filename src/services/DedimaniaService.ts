'use strict'

import { DedimaniaClient } from '../dedimania/DedimaniaClient.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { PlayerService } from './PlayerService.js'

export abstract class DedimaniaService {

    static async initialize(): Promise<void> {
        await DedimaniaClient.connect('dedimania.net', Number(process.env.DEDIMANIA_PORT)).catch(err => {
            ErrorHandler.fatal('Failed to connect to dedimania', err)
        })
        this.updateServerPlayers()
    }

    static async getRecords(id: string, name: string, environment: string, author: string): Promise<any[]> {
        const records = await DedimaniaClient.call('dedimania.CurrentChallenge',
            [
                { string: id },
                { string: name },
                { string: environment },
                { string: author },
                { string: 'TMF' },
                { int: 1 }, //mode: 1-TA
                {
                    struct: {
                        SrvName: { string: process.env.SERVER_NAME }
                    }
                },
                { int: 30 }, //number of records probably
                { array: [] } //idk
            ]
        )
            .catch(err => ErrorHandler.error(`Failed to fetch dedimania records for challenge: ${name}`, err))
        if (!records)
            throw new Error('unable to fetch records')
        return records
    }

    private static updateServerPlayers() {
        setInterval(async () => {
            const status = await DedimaniaClient.call('dedimania.UpdateServerPlayers', [
                { string: process.env.SERVER_GAME },
                { int: PlayerService.players.length },
                {
                    struct: {
                        SrvName: { string: process.env.SERVER_NAME }
                    }
                },
                { array: [] }
            ]
            ).catch(err => ErrorHandler.error('Error when trying to update dedimania status', err))
            if (!status)
                ErrorHandler.error('Failed to update dedimania status')
        }, 240000)
    }
}