import fetch from 'node-fetch'
import xml2js from 'xml2js'
import type { MKMapVotes, MKVote } from './ManiakarmaTypes.js'
import config from './Config.js'
import countries from './Countries.js'

let authCode: string
let isConnected = false
let apiUrl: string
let mapKarmaValue = 0
let mapKarma: MKMapVotes = { fantastic: 0, beautiful: 0, good: 0, bad: 0, poor: 0, waste: 0 }
const playerVotes: MKVote[] = []
const newVotes: MKVote[] = []
let lastMap: Readonly<tm.CurrentMap>

const mapFetchListeners: ((info: { votes: MKVote[], ratio: number, karma: MKMapVotes }) => void)[] = []
const voteListeners: ((votes: MKVote[]) => void)[] = []
const playerFetchListeners: ((vote: MKVote) => void)[] = []
const defaultKarmaObject: Readonly<MKMapVotes> = {
  fantastic: 0,
  beautiful: 0,
  good: 0,
  bad: 0,
  poor: 0,
  waste: 0
}

const emitMapFetch = (votes: MKVote[], ratio: number, karma: MKMapVotes): void => {
  for (const e of mapFetchListeners) { e({ votes, ratio, karma }) }
}

const emitVote = (...votes: MKVote[]): void => {
  for (const e of voteListeners) { e(votes) }
}

const emitPlayerFetch = (vote: MKVote): void => {
  for (const e of playerFetchListeners) { e(vote) }
}

const checkResError = (json: any): boolean => {
  return json?.result?.status?.[0] !== '200'
}

const initialize = async (): Promise<void> => {
  lastMap = tm.maps.current
  const status: true | Error = await authenticate()
  if (status instanceof Error) {
    tm.log.error(`Failed to connect to maniakarma`, status.message)
    void reinitialize()
    return
  }
  isConnected = true
  await fetchVotes(...tm.players.list.map(a => a.login))
  tm.log.trace('Connected to Maniakarma')
  emitMapFetch(playerVotes, mapKarmaValue, mapKarma)
}

const reinitialize = async (): Promise<void> => {
  let status: true | Error
  do {
    await new Promise((resolve) => setTimeout(resolve, config.reconnectTimeout * 1000))
    status = await authenticate()
  } while (status !== true)
  tm.log.info('Initialized maniakarma after an error')
  isConnected = true
  await fetchVotes(...tm.players.list.map(a => a.login))
  emitMapFetch(playerVotes, mapKarmaValue, mapKarma)
}

const authenticate = async (): Promise<true | Error> => {
  const url = `http://worldwide.mania-karma.com/api/tmforever-trackmania-v4.php?Action=Auth&${new URLSearchParams({
    login: tm.config.server.login,
    name: Buffer.from(tm.config.server.name).toString('base64'),
    game: tm.config.server.game,
    zone: tm.config.server.zone,
    nation: countries.find(a => a.name === tm.config.server.zone.split('|')[0])?.code ?? 'POL' // SEE EXPLANATION WHY POLAND IN THE COUNTRIES.JS FILE
  })}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    return res
  }
  if (!res.ok) {
    return new Error(`Maniakarma failed to authenticate. Code: ${res.status} Text: ${res.statusText}`)
  }
  const json: any = getJson(await res.text())
  if (checkResError(json)) {
    return new Error('Maniakarma failed to authenticate')
  }
  authCode = json?.result?.authcode?.[0]
  apiUrl = json?.result?.api_url?.[0]
  return true
}

const fetchVotes = async (...logins: string[]): Promise<MKVote[] | Error> => {
  newVotes.length = 0
  playerVotes.length = 0
  if (logins.length === 0) { return [] }
  const url = `${apiUrl}?Action=Get&${new URLSearchParams({
    login: tm.config.server.login,
    authcode: authCode,
    uid: tm.maps.current.id,
    map: Buffer.from(tm.maps.current.name).toString('base64'),
    author: tm.maps.current.author,
    env: tm.maps.current.environment,
    player: logins.join('|')
  })}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(`Failed to fetch maniakarma votes`, res.message)
    return res
  }
  if (!res.ok) {
    const err = new Error(`Failed to fetch maniakarma votes. Code: ${res.status} Text: ${res.statusText}`)
    tm.log.error(err.message)
    return err
  }
  const json: any = getJson(await res.text())
  if (checkResError(json)) {
    const err = new Error(`Failed to fetch maniakarma votes, received` +
      ` response:\n${JSON.stringify(json, null, 2)}`)
    tm.log.error(err.message)
    return err
  }
  mapKarmaValue = Number(json?.result?.votes?.[0]?.karma?.[0])
  for (const key of Object.keys(mapKarma)) {
    mapKarma[key as keyof typeof mapKarma] = Number(json?.result?.votes?.[0]?.[key]?.[0]?.$?.count)
  }
  const ret: MKVote[] = []
  for (const e of json?.result?.players[0]?.player) {
    const vote = Number(e?.$?.vote)
    const login = e?.$?.login
    const arr: [-3, -2, -1, 1, 2, 3] = [-3, -2, -1, 1, 2, 3]
    const v = arr.find(a => a === vote)
    if (v !== undefined) {
      ret.push({ mapId: tm.maps.current.id, vote: v, login })
      storePlayerVotes(login, v)
    }
  }
  await fixCoherence()
  return ret
}

const sendVotes = async (newVotes: MKVote[]): Promise<void> => {
  if (newVotes.length === 0) { return }
  const url = `${apiUrl}?Action=Vote&${new URLSearchParams({
    login: tm.config.server.login,
    authcode: authCode,
    uid: lastMap.id,
    map: Buffer.from(lastMap.name).toString('base64'),
    author: lastMap.author,
    atime: lastMap.authorTime.toString(),
    ascore: '0', // STUNTS MODE IDC
    nblaps: lastMap.defaultLapsAmount.toString(),
    nbchecks: lastMap.checkpointsAmount.toString(),
    mood: lastMap.mood,
    env: lastMap.environment,
    votes: getVoteString(newVotes),
    tmx: '' // LEFTOVER FROM TM2
  })}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(`Failed to send maniakarma votes for map ${lastMap.id}.`, res.message)
    return
  }
  if (!res.ok) {
    tm.log.error(`Failed to send maniakarma votes for map ${lastMap.id}.`,
      `Code: ${res.status} Text: ${res.status}`)
    return
  }
  const json = getJson(await res.text())
  if (checkResError(json)) {
    tm.log.error(`Failed to send maniakarma votes for map ${lastMap.id}, received response:`, JSON.stringify(json, null, 2))
  }
}

const storePlayerVotes = (login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): void => {
  playerVotes.push({
    mapId: tm.maps.current.id,
    login: login,
    vote: vote
  })
}

const getVoteString = (newVotes: MKVote[]): string => {
  const voteString: string[] = []
  const count: any = {}
  for (const player of newVotes) {
    count[player.login] = (count[player.login] ?? 0) + 1
  }
  const filteredVotes: MKVote[] = newVotes.filter(a => count[a.login]-- === 1)
  for (const vote of filteredVotes) {
    voteString.push(vote.login + `=` + vote.vote)
  }
  return voteString.join('|')
}

const getJson = (data: string): any => {
  let json: any
  xml2js.parseString(data.toString(), (err, result): void => {
    if (err !== null) {
      throw err
    }
    json = result
  })
  return json
}

function addVote(mapId: string, login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): void
function addVote(mapId: string, votes: readonly { login: string, vote: -3 | -2 | -1 | 1 | 2 | 3 }[]): void
function addVote(mapId: string, arg: string | readonly { login: string, vote: -3 | -2 | -1 | 1 | 2 | 3 }[]
  , vote?: -3 | -2 | -1 | 1 | 2 | 3): void {
  const voteNames: string[] = ['waste', 'poor', 'bad', 'good', 'beautiful', 'fantastic']
  if (Array.isArray(arg)) {
    const updated: MKVote[] = []
    for (const e of arg) {
      const v: MKVote | undefined = playerVotes.find(a => a.login === e.login)
      if (v?.login === e.login && v?.vote === e.vote) { continue }
      mapKarma[voteNames[e.vote > 0 ? e.vote + 2 : e.vote + 3] as keyof typeof mapKarma]++
      if (v === undefined) {
        const obj = { mapId, login: e.login, vote: e.vote }
        playerVotes.push(obj)
        updated.push(obj)
      }
      else {
        mapKarma[voteNames[v.vote > 0 ? v.vote + 2 : v.vote + 3] as keyof typeof mapKarma]--
        v.vote = e.vote
        updated.push(v)
      }
      const newVote: MKVote | undefined = newVotes.find(a => a.login === e.login)
      if (newVote === undefined) { newVotes.push({ mapId, login: e.login, vote: e.vote }) }
      else { newVote.vote = e.vote }
      const voteValues = { waste: 0, poor: 20, bad: 40, good: 60, beautiful: 80, fantastic: 100 }
      const count = Object.values(mapKarma).reduce((acc, cur) => acc + cur, 0)
      mapKarmaValue = Object.entries(mapKarma).map(a => (voteValues as any)[a[0]] * a[1]).reduce((acc, cur): number => acc + cur, 0) / count
    }
    emitVote(...updated)
    return
  }
  if (vote === undefined) { return }
  const login = arg as string
  mapKarma[voteNames[vote > 0 ? vote + 2 : vote + 3] as keyof typeof mapKarma]++
  const v: MKVote | undefined = playerVotes.find(a => a.login === login)
  if (v?.login === login && v.vote === vote) { return }
  if (v === undefined) { playerVotes.push({ mapId, login, vote }) }
  else {
    mapKarma[voteNames[v.vote > 0 ? v.vote + 2 : v.vote + 3] as keyof typeof mapKarma]--
    v.vote = vote
  }
  const newVote: MKVote | undefined = newVotes.find(a => a.login === login)
  if (newVote === undefined) { newVotes.push({ mapId, login, vote }) }
  else { newVote.vote = vote }
  const voteValues = { waste: 0, poor: 20, bad: 40, good: 60, beautiful: 80, fantastic: 100 }
  const count = Object.values(mapKarma).reduce((acc, cur) => acc + cur, 0)
  mapKarmaValue = Object.entries(mapKarma).map(a => (voteValues as any)[a[0]] * a[1]).reduce((acc, cur): number => acc + cur, 0) / count
  emitVote({ mapId, login, vote })
}

const fixCoherence = async (): Promise<void> => {
  const localVotes: tm.Vote[] = tm.karma.current
  const mkVotes: MKVote[] = playerVotes
  for (const e of mkVotes) {
    const v: tm.Vote | undefined = localVotes.find(a => a.login === e.login && a.vote === e.vote)
    if (v === undefined) {
      const nickname: string | undefined = tm.players.get(e.login)?.nickname
      tm.karma.add({ login: e.login, nickname: nickname ?? e.login }, e.vote)
    }
  }
  addVote(tm.maps.current.id, localVotes)
}

const onBeginMap = async (isRestart: boolean): Promise<void> => {
  const newV = newVotes
  if (!isRestart) { // Reset the votes on before fetch
    playerVotes.length = 0
    newVotes.length = 0
    mapKarmaValue = 0
    mapKarma = { ...defaultKarmaObject }
    emitMapFetch(playerVotes, mapKarmaValue, mapKarma)
  }
  await sendVotes(newV)
  if (!isRestart) {
    await fetchVotes(...tm.players.list.map(a => a.login))
  }
  emitMapFetch(playerVotes, mapKarmaValue, mapKarma)
  lastMap = tm.maps.current
}

const onPlayerJoin = async (login: string): Promise<void> => {
  const votes: MKVote[] | Error = await fetchVotes(login)
  if (!(votes instanceof Error)) {
    emitPlayerFetch(votes[0])
  }
}

if (config.isEnabled) {
  tm.addListener('Startup', (): void => {
    tm.log.trace('Connecting to Maniakarma...')
    void initialize()
    setInterval((): void => {
      if (!isConnected) { void initialize() }
    }, config.reconnectTimeout * 1000)
  }, true)
  tm.addListener('PlayerJoin', (info): void => {
    void onPlayerJoin(info.login)
  }, true)
  tm.addListener('BeginMap', (info): void => {
    void onBeginMap(info.isRestart)
  }, true)
  tm.addListener('KarmaVote', (info): void => {
    addVote(tm.maps.current.id, info)
  })
}

/**
 * Gets the players maniakarma vote on the current map
 * @param login Player login
 * @returns Vote object or undefined if the player didn't vote
 */
function getVote(login: string): MKVote | undefined
/**
 * Gets multiple maniakarma votes on the current map
 * @param logins Array of player logins
 * @returns Array of vote objects
 */
function getVote(logins: string[]): MKVote[]
function getVote(logins: string | string[]): MKVote | MKVote[] | undefined {
  if (typeof logins === 'string') {
    return playerVotes.find(a => a.login === logins)
  }
  return playerVotes.filter(a => logins.includes(a.login))
}

/**
 * Gets the players new maniakarma vote on the current map
 * @param login Player login
 * @returns Vote object or undefined if the player didn't change his vote in this round
 */
function getNewVote(login: string): MKVote | undefined
/**
 * Gets multiple new maniakarma votes on the current map
 * @param logins Array of player logins
 * @returns Array of vote objects
 */
function getNewVote(logins: string[]): MKVote[]
function getNewVote(logins: string | string[]): MKVote | MKVote[] | undefined {
  if (typeof logins === 'string') {
    return newVotes.find(a => a.login === logins)
  }
  return newVotes.filter(a => logins.includes(a.login))
}

/**
 * Fetches and sends maniakarma votes.
 * Provides utilities for accessing maniakarma votes related data.
 * @author lythx & wiseraven
 * @since 0.1
 */
export const maniakarma = {

  /**
   * Adds a callback function to execute on maniakarma vote
   * @param callback Function to execute on event. It takes new vote object as a parameter
   */
  onVote(callback: ((votes: MKVote[]) => void)) {
    voteListeners.push(callback)
  },

  /**
   * Adds a callback function to execute when maniakarma votes for new map get fetched
   * @param callback Function to execute on event. It takes object of votes array and map vote ratio
   */
  onMapFetch(callback: ((data: { votes: MKVote[], ratio: number, karma: MKMapVotes }) => void)) {
    mapFetchListeners.push(callback)
  },

  /**
   * Adds a callback function to execute when maniakarma vote for new player gets fetched
   * @param callback Function to execute on event. It takes fetched vote object as a parameter
   */
  onPlayerFetch(callback: (votes: MKVote) => void) {
    playerFetchListeners.push(callback)
  },

  getVote,

  getNewVote,

  /**
   * Current map maniakarma votes
   */
  get votes(): Readonly<MKVote>[] {
    return [...playerVotes]
  },

  /**
   * Current map new maniakarma votes
   */
  get newVotes(): Readonly<MKVote>[] {
    return [...newVotes]
  },

  /**
   * Current map maniakarma vote count
   */
  get voteCount(): number {
    return playerVotes.length
  },

  /**
   * Current map new maniakarma vote count
   */
  get newVoteCount(): number {
    return newVotes.length
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled,

  /**
   * Current map karma value
   */
  get mapKarmaRatio(): number {
    return mapKarmaValue
  },

  /**
   * Object containing vote counts for each vote type
   */
  get mapKarma(): MKMapVotes {
    return mapKarma
  },

  /**
   * True if controller is connected to maniakarma server
   */
  get isConnected(): boolean {
    return isConnected
  }

}

export type { MKMapVotes, MKVote }
