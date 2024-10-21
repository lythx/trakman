import http, { ClientRequest } from 'http'
import config from './Config.js'
import 'dotenv/config'

let isConnected: boolean = false
const password = process.env.FREEZONE_PASSWORD

const sendLive = async (): Promise<true | Error> => {
  // Request URL
  const url: string = config.manialiveUrl
  const cfg: tm.ServerInfo = tm.config.server
  // Data object in any because TS coping language
  const data = {
    serverLogin: cfg.login,
    // Remove colours here so that we won't have to later
    serverName: tm.utils.strip(cfg.name, true),
    serverVersion: [cfg.game, cfg.version, cfg.build].join(),
    manialiveVersion: config.manialiveVersion,
    // Check if > 40 and set to 40 in that case
    maxPlayers: cfg.currentMaxPlayers > 40 ? 40 : cfg.currentMaxPlayers,
    // Public is 1, private is 0
    visibility: cfg.password.length === 0 ? 1 : 0,
    classHash: config.manialiveHash
  }
  // Append freezone to the server name if it isn't there already
  if (!data.serverName.toLowerCase().includes('freezone')) {
    // If the resulting name is too long, trim it to (presumably) max value
    data.serverName = ('Freezone|' + data.serverName).substring(0, 75)
  }
  // Get authentication string
  const auth: string = 'Basic ' + Buffer.from(`${data.serverLogin}:${password}`).toString('base64')
  const options = {
    host: url,
    path: `/freezone/live/`,
    method: 'POST',
    headers: {
      'Authorization': auth,
    }
  }
  return new Promise<true | Error>((resolve, reject): void => {
    const req: ClientRequest = http.request(options, (res): void => {
      if (res.statusCode === 200) {
        resolve(true)
        return
      }
      let data: string = ''
      res.on('data', (chunk): void => { data += chunk })
      res.on('end', (): void => reject(new Error(`Status code: ${res.statusCode}, message: ${data}`)))
    })
    req.write(JSON.stringify(data))
    req.on('error', (): void => {
      reject(new Error(`HTTP request error.`))
    }).on('timeout', (): void => {
      reject(new Error(`HTTP request timeout.`))
    }).end()
  }).catch((err): Error => {
    const errStr = `Couldn't send Freezone Manialive request. Error: ${err?.message}`
    tm.log.error(errStr)
    return new Error(errStr)
  })
}

const initialize = async (): Promise<true | Error> => {
  if (password === undefined) {
    return new Error('FREEZONE_PASSWORD is undefined. Update your .env file to use the Freezone plugin.')
  }
  const status: true | Error = await sendLive()
  if (status instanceof Error) {
    return new Error('Failed to authenticate on ManiaLive.')
  }
  setInterval(async (): Promise<void> => {
    await sendLive()
  }, 3600000)
  isConnected = true
  return true
}

if (config.isEnabled) {
  tm.addListener('Startup', async (): Promise<void> => {
    tm.log.trace('Connecting to ManiaLive...')
    const status: true | Error = await initialize()
    if (status instanceof Error) { tm.log.error(status.message) }
    else { tm.log.trace('Connected to ManiaLive') }
  })
}

/**
 * Sends manialive requests needed for freezone.
 * @author lythx & wiseraven
 * @since 0.3
 */
export const freezone = {

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled,

  /**
   * True if controller is connected to manialive
   */
  get isConnected(): boolean {
    return isConnected
  }

}
