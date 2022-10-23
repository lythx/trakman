import config from './Config.js'
import http from 'http'

interface WebservicesInfo {
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
let isMapRestart = false
const cachedAuthors: WebservicesInfo[] = []

const fetchWebservices = async (login: string): Promise<{
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
    http.request(options, (res): void => {
      let data: string = ''
      res.on('data', (chunk): void => { data += chunk })
      if (res.statusCode === 200) {
        res.on('end', (): void => resolve(JSON.parse(data)))
        return
      }
      res.on('end', (): void => resolve(new Error(data)))
    }).end()
  })
}

/**
 * Fetches Trackmania Webservices for player information
 * @param login Player login
 * @returns Player information object or error if unsuccessful
 */
const fetchPlayer = async (login: string): Promise<WebservicesInfo | Error> => {
  const cacheEntry = cachedAuthors.find(a => a.login === login)
  if (cacheEntry !== undefined) { return cacheEntry }
  if (regex.test(login) === true) { return new Error(`Login doesn't pass regex test`) }
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
  const curRes = await fetchPlayer(tm.maps.current.author)
  if (!(curRes instanceof Error)) { curAuthor = curRes }
  for (const e of currentAuthorListeners) { e(curAuthor) }
  const nextRes = await fetchPlayer(tm.jukebox.queue[0].id)
  if (!(nextRes instanceof Error)) { nextAuthor = nextRes }
  for (const e of nextAuthorListeners) { e(nextAuthor) }
})

tm.addListener('EndMap', (info): void => { isMapRestart = info.isRestart })
tm.addListener('BeginMap', () => { isMapRestart = false })

tm.addListener('JukeboxChanged', async (): Promise<void> => {
  const curLogin = tm.maps.current.author
  if (curAuthor?.login !== curLogin) {
    const res = await fetchPlayer(curLogin)
    if (res instanceof Error) { curAuthor = undefined }
    else { curAuthor = res }
  }
  for (const e of currentAuthorListeners) { e(curAuthor) }
  const nextLogin = tm.jukebox.queue[0].author
  if (nextAuthor?.login !== nextLogin) {
    const res = await fetchPlayer(nextLogin)
    if (res instanceof Error) { nextAuthor = undefined }
    else { nextAuthor = res }
  }
  for (const e of nextAuthorListeners) { e(nextAuthor) }
})

/**
 * Provides utilites for fetching player data from Trackmania Webservices.
 * Fetches and stores current and next map author data
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
  get currentAuthor() {
    return curAuthor
  },

  /**
   * Next map author webservices data
   */
  get nextAuthor() {
    if (isMapRestart === true) { return curAuthor }
    return nextAuthor
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled

}
