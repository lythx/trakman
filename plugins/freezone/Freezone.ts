import config from './Freezone.json' assert { type: "json" }
import { Logger } from '../../src/Logger.js'
import { ServerConfig } from '../../src/ServerConfig.js'
import fetch from 'node-fetch'
import tls from 'node:tls'
import 'dotenv/config'

// Thanks Nadeo for up-to-date certificates
if (process.env.USE_FREEZONE === 'YES') {
    tls.DEFAULT_MIN_VERSION = 'TLSv1'
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export class Freezone {

    // Manialive hash, static value that never changes
    private static manialiveHash: string = '6f116833b419fe7cb9c912fdaefb774845f60e79'
    // Last Manialive version release
    private static manialiveVersion: number = 239
    // Freezone WS password, received on 'freezone:servers' manialink in-game
    private static freezonePassword: string = config.password
    // Freezone ManiaLive URL
    private static manialiveUrl: string = 'http://ws.trackmania.com'

    static async initialize(): Promise<void | Error> {
        const status: void | Error = await this.sendLive()
        if (status instanceof Error) {
            Logger.fatal(`Couldn't connect to ManiaLive`)
        }
        setInterval(async (): Promise<void> => {
            await this.sendLive()
        }, 360000)
    }

    static async sendLive(): Promise<void | Error> {
        // Request URL
        const url: string = this.manialiveUrl + `/freezone/live/`
        const cfg: ServerInfo = ServerConfig.config
        // Data object in any because TS coping language
        const data: any = {
            serverLogin: cfg.login,
            serverName: cfg.name,
            serverVersion: [cfg.game, cfg.version, cfg.build].join(),
            manialiveVersion: this.manialiveVersion,
            maxPlayers: cfg.currentMaxPlayers,
            visibility: cfg.password.length === 0 ? true : false, // Maybe reversed statement
            classHash: this.manialiveHash
        }
        // Append freezone to the server name if it isn't there already
        if (!cfg.name.includes('freezone')) {
            data.serverName = 'Freezone|' + data.serverName
        }
        // Get authentication string
        const auth: string = 'Basic ' + Buffer.from(`${cfg.login}:${this.freezonePassword}`).toString('base64')
        // Do the performance
        const res = await fetch(url, {
            method: 'post',
            headers: {
                'Authorization': auth
            },
            body: JSON.stringify(data)
        }).catch(err => err)
        // 😨😨😨😨
        if (res instanceof Error) {
            Logger.error(`Couldn't send Freezone ManiaLive request`)
        }
    }
}
