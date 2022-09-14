import { Logger } from '../../src/Logger.js'
import { ServerConfig } from '../../src/ServerConfig.js'
import http, { ClientRequest } from 'http'
import config from './Config.js' // FIX IMPORTS AND DELETE CALL FROM MAIN

export class Freezone {

  static async initialize(): Promise<true | Error> {
    // if (process.env.FREEZONE_PASSWORD === undefined) { TODO delete if pw not in env
    //   Logger.fatal('FREEZONE_PASSWORD is not defined')
    //   return new Error()
    // }
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
    const url: string = config.manialiveUrl
    const cfg: ServerInfo = ServerConfig.config
    // Data object in any because TS coping language
    const data = {
      serverLogin: cfg.login,
      // Remove the if below for shorthand here?
      serverName: cfg.name,
      serverVersion: [cfg.game, cfg.version, cfg.build].join(),
      manialiveVersion: config.manialiveVersion,
      // Check if > 40 and set to 40 in that case
      maxPlayers: cfg.currentMaxPlayers,
      visibility: cfg.password.length === 0 ? 1 : 0, // Maybe reversed statement
      classHash: config.manialiveHash
    }
    // Append freezone to the server name if it isn't there already
    if (!cfg.name.toLowerCase().includes('freezone')) {
      // If the resulting name is too long, trim it to (presumably) max value
      data.serverName = ('Freezone|' + data.serverName).substring(0, 80)
    }
    // Get authentication string
    const auth: string = 'Basic ' + Buffer.from(`${data.serverLogin}:${config.freezonePassword}`).toString('base64')
    const options = {
      host: url,
      path: `/freezone/live/`,
      method: 'POST',
      headers: {
        'Authorization': auth,
      }
    }
    return new Promise((resolve): void => {
      const req: ClientRequest = http.request(options, function (res): void {
        if (res.statusCode === 200) {
          resolve(true)
          return
        }
        let data: string = ''
        res.on('data', function (chunk): void {
          data += chunk
        })
        Logger.error(`Couldn't send Freezone Manialive request`, data)
        res.on('end', (): void => resolve(new Error(data)))
      })
      req.write(JSON.stringify(data))
      req.end()
    })
  }
}
