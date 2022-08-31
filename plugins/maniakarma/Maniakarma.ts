import fetch from 'node-fetch'
import xml2js from 'xml2js'
import { trakman as tm } from '../../src/Trakman.js'
import { MKMapVotes, MKVote } from './ManiakarmaTypes.js'
import config from './Config.js'

let authCode: string
let isConnected = false
let apiUrl: string
let mapKarmaValue: number = 0
let mapKarma: MKMapVotes = { fantastic: 0, beautiful: 0, good: 0, bad: 0, poor: 0, waste: 0 }
let playerVotes: MKVote[] = []
let newVotes: MKVote[] = []
let lastMap: Readonly<TMCurrentMap>

const mapFetchListeners: ((info: { votes: MKVote[], ratio: number, karma: MKMapVotes }) => void)[] = []
const voteListeners: ((vote: MKVote) => void)[] = []
const playerFetchListeners: ((vote: MKVote) => void)[] = []

const emitMapFetch = (votes: MKVote[], ratio: number, karma: MKMapVotes) => {
  for (const e of mapFetchListeners) { e({ votes, ratio, karma }) }
}

const emitVote = (vote: MKVote) => {
  for (const e of voteListeners) { e(vote) }
}

const emitPlayerFetch = (vote: MKVote) => {
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
}

const authenticate = async (): Promise<true | Error> => {
  const url: string = `http://worldwide.mania-karma.com/api/tmforever-trackmania-v4.php?Action=Auth&${new URLSearchParams({
    login: tm.state.serverConfig.login,
    name: Buffer.from(tm.state.serverConfig.name).toString('base64'),
    game: tm.state.serverConfig.game,
    zone: tm.state.serverConfig.zone,
    nation: tm.utils.countryToCode(tm.state.serverConfig.zone.split('|')[0]) ?? 'OTH'
  })}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    return res
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
  if(logins.length === 0) { return []}
  const url: string = `${apiUrl}?Action=Get&${new URLSearchParams({ // TODO check what happens if bs data
    login: tm.state.serverConfig.login,
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
  const json: any = getJson(await res.text())
  if (checkResError(json)) {
    tm.log.error(`Failed to fetch maniakarma votes, received response:`, JSON.stringify(json, null, 2))
    return new Error(`Failed to fetch maniakarma votes`)
  }
  mapKarmaValue = Number(json?.result?.votes?.[0]?.karma?.[0]) // TODO check if its a number
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
  return ret
  // TODO remove this when works
  //Logger.debug(`curr. map maniakarma stats`, `mk api url: ` + apiUrl, `mk api authcode: ` + authCode, `mk karma value: ` + _mapKarmaValue.toString(), `mk vote stats: ` + JSON.stringify(_mapKarma))
  // TODO enable after voteservice is fixed
  // await fixCoherence()
}

const sendVotes = async (): Promise<void> => {
  if (newVotes.length === 0) { return }
  const url: string = `${apiUrl}?Action=Vote&${new URLSearchParams({
    login: tm.state.serverConfig.login,
    authcode: authCode,
    uid: lastMap.id,
    map: Buffer.from(lastMap.name).toString('base64'),
    author: lastMap.author,
    atime: lastMap.authorTime.toString(),
    ascore: '0', // TODO STUNTS MODE IDC
    nblaps: lastMap.lapsAmount.toString(),
    nbchecks: lastMap.checkpointsAmount.toString(),
    mood: lastMap.mood,
    env: lastMap.environment,
    votes: getVoteString(),
    tmx: '' // LEFTOVER FROM TM2
  })}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(`Failed to send maniakarma votes for map ${lastMap.id}`, res.message)
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

const getVoteString = (): string => {
  let voteString: string[] = []
  const count: any = {}
  for (const player of newVotes) {
    count[player.login] = (count[player.login] ?? 0) + 1
  }
  const newVotesCopy: MKVote[] = newVotes.filter(a => count[a.login]-- === 1)
  for (const vote of newVotesCopy) {
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

const addVote = (mapId: string, login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): void => {
  const voteNames: string[] = ['waste', 'poor', 'bad', 'good', 'beautiful', 'fantastic'];
  mapKarma[voteNames[vote > 0 ? vote + 2 : vote + 3] as keyof typeof mapKarma]++
  const v = playerVotes.find(a => a.login === login)
  if (v === undefined) { playerVotes.push({ mapId, login, vote }) }
  else {
    mapKarma[voteNames[v.vote > 0 ? v.vote + 2 : v.vote + 3] as keyof typeof mapKarma]--
    v.vote = vote
  }
  const newVote = newVotes.find(a => a.login === login)
  if (newVote === undefined) { newVotes.push({ mapId, login, vote }) }
  else { newVote.vote = vote }
  const voteValues = { waste: 0, poor: 20, bad: 40, good: 60, beautiful: 80, fantastic: 100 }
  const count = Object.values(mapKarma).reduce((acc, cur) => acc + cur, 0)
  mapKarmaValue = Object.entries(mapKarma).map(a => (voteValues as any)[a[0]] * a[1]).reduce((acc, cur) => acc + cur, 0) / count
  emitVote({ mapId, login, vote })
}

// TODO enable when voteservice is fixed
// const fixCoherence = async (): Promise<void> => {
//   const localVotes: TMVote[] = tm.karma.current
//   const mkVotes: MKVote[] = playerVotes
//   for (const e of mkVotes) {
//     if (!localVotes.some(a => a.login === e.login && a.vote === e.vote)) {
//       //  await VoteService.add( e.login, e.vote)
//     }
//   }
//   for (const e of localVotes) {
//     if (!mkVotes.some(a => a.login === e.login && a.vote === e.vote)) {
//       addVote(e.mapId, e.login, e.vote)
//     }
//   }
// }

const onBeginMap = async (isRestart: boolean) => {
  await sendVotes()
  if (isRestart === false) {
    await fetchVotes(...tm.players.list.map(a => a.login))
  }
  emitMapFetch(playerVotes, mapKarmaValue, mapKarma)
  lastMap = tm.maps.current
}

const onPlayerJoin = async (login: string) => {
  const votes = await fetchVotes(login)
  if (!(votes instanceof Error)) {
    emitPlayerFetch(votes[0])
  }
}

if (config.isEnabled === true) {
  tm.addListener('Controller.Ready', () => {
    void initialize()
    setInterval(() => {
      if (isConnected === false) { void initialize() }
    }, config.reconnectTimeout * 1000)
  }, true)
  tm.addListener('Controller.PlayerJoin', (info): void => {
    void onPlayerJoin(info.login)
  }, true)
  tm.addListener('Controller.BeginMap', (info): void => {
    void onBeginMap(info.isRestart)
  }, true)
  tm.addListener('Controller.KarmaVote', (info): void => {
    addVote(tm.maps.current.id, info.login, info.vote)
  })
}

export const maniakarma = {

  /**
   * Adds a callback function to execute on maniakarma vote
   * @param callback Function to execute on event. It takes new vote object as a parameter
   */
  onVote(callback: ((vote: MKVote) => void)) {
    voteListeners.push(callback)
  },

  /**
   * Adds a callback function to execute when maniakarma votes for new map get fetched
   * @param callback Function to execute on event. It takes object of votes array and map vote ratio
   */
  onMapFetch(callback: ((dedis: { votes: MKVote[], ratio: number, karma: MKMapVotes }) => void)) {
    mapFetchListeners.push(callback)
  },

  /**
   * Adds a callback function to execute when maniakarma vote for new player gets fetched
   * @param callback Function to execute on event. It takes fetched vote object as a parameter
   */
  onPlayerFetch(callback: (votes: MKVote) => void) {
    playerFetchListeners.push(callback)
  },

  getVote(logins: string | string[]) {
    if (typeof logins === 'string') {
      return playerVotes.find(a => a.login === logins)
    }
    return playerVotes.filter(a => logins.includes(a.login))
  },

  getNewVote(logins: string | string[]) {
    if (typeof logins === 'string') {
      return newVotes.find(a => a.login === logins)
    }
    return newVotes.filter(a => logins.includes(a.login))
  },

  get votes(): Readonly<MKVote>[] {
    return [...playerVotes]
  },

  get newVotes(): Readonly<MKVote>[] {
    return [...newVotes]
  },

  get voteCount(): number {
    return playerVotes.length
  },

  get newVoteCount(): number {
    return newVotes.length
  },

  get isEnabled(): boolean {
    return config.isEnabled
  },

  get mapKarmaRatio(): number {
    return mapKarmaValue
  },

  get mapKarma(): MKMapVotes {
    return mapKarma
  },

  get isConnected(): boolean {
    return isConnected
  }

}