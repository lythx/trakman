import { Logger } from '../src/Logger.js'
import { ServerConfig } from '../src/ServerConfig.js'
import 'dotenv/config'
import http from 'http'

export class Freezone {

  // Manialive hash, static value that never changes
  private static readonly manialiveHash: string = '6f116833b419fe7cb9c912fdaefb774845f60e79'
  // Last Manialive version release
  private static readonly manialiveVersion: number = 239
  // Freezone WS password, received on 'freezone:servers' manialink in-game
  private static freezonePassword: string
  // Freezone ManiaLive URL
  private static readonly manialiveUrl: string = 'ws.trackmania.com'

  static async initialize(): Promise<true | Error> {
    if (process.env.FREEZONE_PASSWORD === undefined) {
      Logger.fatal('FREEZONE_PASSWORD is not defined')
      return new Error()
    }
    this.freezonePassword = process.env.FREEZONE_PASSWORD
    const status: true | Error = await this.sendLive()
    if (status instanceof Error) {
      Logger.fatal(`Couldn't connect to ManiaLive`)
    }
    setInterval(async (): Promise<void> => {
      await this.sendLive()
    }, 3600000)
    return true
  }

  static async sendLive(): Promise<true | Error> {
    // Request URL
    const url: string = this.manialiveUrl
    const cfg: ServerInfo = ServerConfig.config
    // Data object in any because TS coping language
    const data = {
      serverLogin: cfg.login,
      serverName: cfg.name,
      serverVersion: [cfg.game, cfg.version, cfg.build].join(),
      manialiveVersion: this.manialiveVersion,
      maxPlayers: cfg.currentMaxPlayers,
      visibility: cfg.password.length === 0 ? 1 : 0, // Maybe reversed statement
      classHash: this.manialiveHash
    }
    // Append freezone to the server name if it isn't there already
    if (!cfg.name.toLowerCase().includes('freezone')) {
      data.serverName = 'Freezone|' + data.serverName
    }
    // Get authentication string
    const auth: string = 'Basic ' + Buffer.from(`${data.serverLogin}:${this.freezonePassword}`).toString('base64')
    const options = {
      host: url,
      path: `/freezone/live/`,
      method: 'POST',
      headers: {
        'Authorization': auth,
      }
    }
    return new Promise((resolve) => {
      const req = http.request(options, function (res) {
        if (res.statusCode === 200) {
          resolve(true)
          return
        }
        let data = ''
        res.on('data', function (chunk) {
          data += chunk
        })
        Logger.error(`Couldn't send Freezone ManiaLive request`, data)
        res.on('end', () => resolve(new Error(data)))
      })
      req.write(JSON.stringify(data))
      req.end()
    })
  }
}
