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
  const auth: string = 'Basic ' + Buffer.from(`${data.serverLogin}:${password}`).toString('base64')
  const options = {
    host: url,
    path: `/freezone/live/`,
    method: 'POST',
    headers: {
      'Authorization': auth,
    }
  }
  return new Promise<true | Error>((resolve): void => {
    const req: ClientRequest = http.request(options, (res): void => {
      if (res.statusCode === 200) {
        resolve(true)
        return
      }
      let data: string = ''
      res.on('data', (chunk): void => { data += chunk })
      tm.log.error(`Couldn't send Freezone Manialive request`)
      res.on('end', (): void => resolve(new Error(data)))
    })
    req.write(JSON.stringify(data))
    req.end()
  }).catch(err => {
    tm.log.debug(`Freezone http request error: ${err.message} ${err}`) // TODO CHANGE TO WARN IF WORKS
    return new Error() // TODO WRITE ERROR STR HERE
  })
}

const initialize = async (): Promise<true | Error> => {
  if (password === undefined) {
    return new Error('FREEZONE_PASSWORD is undefined. Check your .env file to use the plugin.')
  }
  const status: true | Error = await sendLive()
  if (status instanceof Error) {
    return new Error('Failed to authenticate on ManiaLive')
  }
  setInterval(async (): Promise<void> => {
    await sendLive()
  }, 3600000)
  isConnected = true
  return true
}

if (config.isEnabled === true) {
  tm.addListener('Startup', async (): Promise<void> => {
    tm.log.trace('Connecting to ManiaLive...')
    const status: true | Error = await initialize()
    if (status instanceof Error) { tm.log.error(status.message) }
    else { tm.log.trace('Connected to ManiaLive') }
  })
}

/**
 * Sends manialive requests needed for freezone
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
