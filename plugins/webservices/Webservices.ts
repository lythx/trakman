import config from './Config.js'
import http from 'http'
import { trakman as tm } from '../../src/Trakman.js'

const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/
const currentAuthorListeners: ((data?: { nickname: string, country: string }) => void)[] = []
const nextAuthorListeners: ((data?: { nickname: string, country: string }) => void)[] = []
let currentAuthorData: { nickname: string, country: string } | undefined
let nextAuthorData: { nickname: string, country: string } | undefined

/**
 * Fetches Trackmania Webservices for player information
 * @param login Player login
 * @returns Player information in JSON or error if unsuccessful
 */
const fetchPlayer = async (login: string): Promise<{
  id: number
  login: string
  nickname: string
  united: boolean
  path: string
  idZone: number
} | Error> => {
  if (config.isEnabled === false) {
    return new Error('Use webservices is set to false')
  }
  const au: string = "Basic " + Buffer.from(`${config.login}:${config.password}`).toString('base64')
  const options = {
    host: `ws.trackmania.com`,
    path: `/tmf/players/${login}/`,
    headers: {
      'Authorization': au,
    }
  }
  return new Promise((resolve): void => {
    http.request(options, function (res): void {
      let data: string = ''
      res.on('data', function (chunk): void {
        data += chunk
      })
      if (res.statusCode === 200) {
        res.on('end', (): void => resolve(JSON.parse(data)))
        return
      }
      res.on('end', (): void => resolve(new Error(data)))
    }).end()
  })
}

const fetchPlayerData = async (login: string): Promise<{ nickname: string, country: string } | Error | false> => {
  if (regex.test(login) === true) { return false }
  const json: any = await fetchPlayer(login)
  if (json instanceof Error) { // UNKOWN PLAYER MOMENT
    return json
  } else {
    return { nickname: json?.nickname, country: (tm.utils.countryToCode(json?.path?.split('|')[1]) as any) }
  }
}

tm.addListener('Startup', async (): Promise<void> => {
  const res = await fetchPlayerData(tm.maps.current.author)
  if (res instanceof Error || res === false) {
    currentAuthorData = undefined
  } else {
    currentAuthorData = res
  }
  for (const e of currentAuthorListeners) {
    e(currentAuthorData)
  }
})

tm.addListener('EndMap', async (info): Promise<void> => {
  if (info.isRestart === true) {
    nextAuthorData === currentAuthorData
    for (const e of nextAuthorListeners) {
      e(nextAuthorData)
    }
    return
  }
  const res = await fetchPlayerData(tm.jukebox.queue[0].author)
  if (res instanceof Error || res === false) {
    nextAuthorData = undefined
  } else {
    nextAuthorData = res
  }
  for (const e of nextAuthorListeners) {
    e(nextAuthorData)
  }
})

tm.addListener('JukeboxChanged', async (): Promise<void> => {
  if (tm.state.current === 'result') {
    const res = await fetchPlayerData(tm.jukebox.queue[0].author)
    if (res instanceof Error || res === false) {
      nextAuthorData = undefined
    } else {
      nextAuthorData = res
    }
    for (const e of nextAuthorListeners) {
      e(nextAuthorData)
    }
  }
})

tm.addListener('BeginMap', (): void => {
  currentAuthorData = nextAuthorData
  nextAuthorData = undefined
  for (const e of currentAuthorListeners) {
    e(currentAuthorData)
  }
  for (const e of nextAuthorListeners) {
    e(nextAuthorData)
  }
})

export const webservices = {

  /**
   * Fetches Trackmania Webservices for player information
   * @param login Player login
   * @returns Player information in JSON or error if unsuccessful
   */
  fetchPlayer,

  /**
   * Adds callback listener executed when current map author webservices data gets changed
   * @param callback callback function to execute on event
   */
  onCurrentAuthorChange: (callback: ((data?: { nickname: string, country: string }) => void)) => {
    currentAuthorListeners.push(callback)
  },

  /**
   * Adds callback listener executed when next map author webservices data gets changed
   * @param callback callback function to execute on event
   */
  onNextAuthorChange: (callback: ((data?: { nickname: string, country: string }) => void)) => {
    nextAuthorListeners.push(callback)
  },

  /**
   * @returns current map author webservices data
   */
  get currentAuthor() {
    return currentAuthorData
  },

  /**
   * @returns next map author webservices data
   */
  get nextAuthor() {
    return nextAuthorData
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled

}

