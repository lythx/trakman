import http, { ClientRequest } from 'http'
import config from './Config.js'
import { trakman as tm } from '../../src/Trakman.js'

let isConnected = false

const sendLive = async (): Promise<true | Error> => {
  // Request URL
  const url: string = config.manialiveUrl
  const cfg: ServerInfo = tm.state.serverConfig
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
      tm.log.error(`Couldn't send Freezone Manialive request`)
      res.on('end', (): void => resolve(new Error(data)))
    })
    req.write(JSON.stringify(data))
    req.end()
  })
}

const initialize = async (): Promise<true | Error> => {
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
  tm.addListener('Startup', async () => {
    tm.log.trace('Connecting to ManiaLive...')
    const status: true | Error = await initialize()
    if (status instanceof Error) { tm.log.error(status.message) }
    else { tm.log.trace('Connected to ManiaLive') }
  })
}

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
