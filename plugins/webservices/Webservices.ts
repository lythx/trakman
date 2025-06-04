import config from './Config.js'
import http from 'http'

const wsLogin: string | undefined = process.env.WEBSERVICES_LOGIN
const wsPassword: string | undefined = process.env.WEBSERVICES_PASSWORD

type FetchReturnType = {
  id: number
  login: string
  nickname: string
  united: boolean
  path: string
  idZone: number
} | Error

export interface WebservicesInfo {
  id: number,
  login: string,
  united: boolean,
  idZone: number
  nickname: string,
  region: string,
  country: string,
  countryCode: string
}
const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/
const currentAuthorListeners: ((data?: Readonly<WebservicesInfo>) => void)[] = []
const nextAuthorListeners: ((data?: Readonly<WebservicesInfo>) => void)[] = []
let curAuthor: WebservicesInfo | undefined
let nextAuthor: WebservicesInfo | undefined
let isMapRestart: boolean = false
const cachedAuthors: WebservicesInfo[] = []

const emitCurrentAuthorFetch = () => {
  for (const e of currentAuthorListeners) { e(curAuthor) }
}

const emitNextAuthorFetch = () => {
  for (const e of nextAuthorListeners) { e(nextAuthor) }
}

const fetchWebservices = async (login: string): Promise<FetchReturnType> => {
  if (!config.isEnabled) {
    return new Error('Use webservices is set to false')
  }
  const options = {
    host: `ws.trackmania.com`,
    path: `/tmf/players/${login}/`,
    method: 'GET',
    headers: {
      'Authorization': "Basic " + Buffer.from(`${wsLogin}:${wsPassword}`).toString('base64'),
    }
  }

  return new Promise<FetchReturnType>((resolve, reject): void => {
    http.request(options, (res): void => {
      let data: string = ''
      res.on('data', (chunk): void => { data += chunk })
      if (res.statusCode === 200) {
        try {
          res.on('end', (): void => { resolve(JSON.parse(data)) })
        } catch(error) {
          reject(new Error(`Instead of a JSON, the request returned the following: ${data}. Error was: ${error}`))
        }
      } else {
        reject(new Error(`Status code: ${res.statusCode}, message: ${data}`))
      }
    }).on('error', (): void => { reject(new Error(`HTTP request error.`)) })
      .on('timeout', (): void => { reject(new Error(`HTTP request timeout.`)) })
      .end()
  }).catch((err: Error): Error => {
    const errStr = `Webservices fetch error: ${err?.message}`
    tm.log.warn(errStr)
    return new Error(errStr)
  })
}

/**
 * Fetches Trackmania Webservices for player information
 * @param login Player login
 * @returns Player information object or error if unsuccessful
 */
const fetchPlayer = async (login: string): Promise<WebservicesInfo | Error> => {
  const cacheEntry: WebservicesInfo | undefined = cachedAuthors.find(a => a.login === login)
  if (cacheEntry !== undefined) { return cacheEntry }
  if (regex.test(login)) { return new Error(`Login doesn't pass regex test`) }
  const player = await fetchWebservices(login)
  if (player instanceof Error) { // UNKOWN PLAYER MOMENT
    return player
  } else {
    const region = tm.utils.getRegionInfo(player.path)
    if (region.countryCode === undefined) { throw new Error(`Received undefined country code from webservices for login ${login}`) }
    const info: WebservicesInfo = {
      id: Number(player.id),
      login: player.login,
      nickname: player.nickname,
      united: Boolean(player.united),
      idZone: Number(player.idZone),
      region: region.region,
      country: region.country,
      countryCode: region.countryCode
    }
    cachedAuthors.unshift(info)
    cachedAuthors.length = Math.min(config.cacheSize, cachedAuthors.length)
    return info
  }
}

tm.addListener('Startup', async (): Promise<void> => {
  if (wsLogin === undefined) {
    tm.log.error('WEBSERVICES_LOGIN is undefined. Check your .env file to use the plugin.')
    return
  }
  if (wsPassword === undefined) {
    tm.log.error('WEBSERVICES_PASSWORD is undefined. Check your .env file to use the plugin.')
    return
  }
  const curRes: WebservicesInfo | Error = await fetchPlayer(tm.maps.current.author)
  if (!(curRes instanceof Error)) { curAuthor = curRes }
  emitCurrentAuthorFetch()
  const nextRes: WebservicesInfo | Error = await fetchPlayer(tm.jukebox.queue[0].id)
  if (!(nextRes instanceof Error)) { nextAuthor = nextRes }
  emitNextAuthorFetch()
})

tm.addListener('EndMap', (info): void => { isMapRestart = info.isRestart })
tm.addListener('BeginMap', (): void => { isMapRestart = false })

tm.addListener('JukeboxChanged', async (): Promise<void> => {
  const curLogin: string = tm.maps.current.author
  if (curAuthor?.login !== curLogin) {
    curAuthor = undefined
    emitCurrentAuthorFetch()
    const res: WebservicesInfo | Error = await fetchPlayer(curLogin)
    if (!(res instanceof Error)) { curAuthor = res }
  }
  emitCurrentAuthorFetch()
  const nextLogin: string = tm.jukebox.queue[0].author
  if (nextAuthor?.login !== nextLogin) {
    nextAuthor = undefined
    emitNextAuthorFetch()
    const res: WebservicesInfo | Error = await fetchPlayer(nextLogin)
    if (!(res instanceof Error)) { nextAuthor = res }
  }
  emitNextAuthorFetch()
})

/**
 * Provides utilites for fetching player data from Trackmania Webservices.
 * Fetches and stores current and next map author data.
 * @author lythx & wiseraven
 * @since 0.1
 */
export const webservices = {

  fetchPlayer,

  /**
   * Adds callback listener executed when current map author webservices data gets changed
   * @param callback callback function to execute on event
   */
  onCurrentAuthorChange: (callback: (data?: Readonly<WebservicesInfo>) => void) => {
    currentAuthorListeners.push(callback)
  },

  /**
   * Adds callback listener executed when next map author webservices data gets changed
   * @param callback callback function to execute on event
   */
  onNextAuthorChange: (callback: (data?: Readonly<WebservicesInfo>) => void) => {
    nextAuthorListeners.push(callback)
  },

  /**
   * Current map author webservices data
   */
  get currentAuthor(): WebservicesInfo | undefined {
    return curAuthor
  },

  /**
   * Next map author webservices data
   */
  get nextAuthor(): WebservicesInfo | undefined {
    if (isMapRestart) { return curAuthor }
    return nextAuthor
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled

}
