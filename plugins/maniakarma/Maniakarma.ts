import fetch from 'node-fetch'
import xml2js from 'xml2js'
import { trakman as tm } from '../../src/Trakman.js'
import { MKMapVotes, MKVote, MKVotesInfo } from './ManiakarmaTypes.js'
import config from './Config.js'

let authCode: string
let isConnected = false
let apiUrl: string
let mapKarmaValue: number = 0
let mapKarma: MKMapVotes = { fantastic: 0, beautiful: 0, good: 0, bad: 0, poor: 0, waste: 0 }
let playerVotes: MKVote[] = []
let newVotes: MKVote[] = []

const initialize = async (): Promise<void> => {
  const status: void | Error = await authenticate()
  if (status instanceof Error) {
    tm.log.error(`Failed to connect to maniakarma`, status.message)
    return
  }
  isConnected = true
  for (const player of tm.players.list) {
    await receiveVotes(player.login)
  }
}

const authenticate = async (): Promise<void | Error> => {
  const url: string = `http://worldwide.mania-karma.com/api/tmforever-trackmania-v4.php`
    + `?Action=Auth`
    + `&login=${tm.state.serverConfig.login}`
    + `&name=${Buffer.from(tm.state.serverConfig.name).toString('base64')}`
    + `&game=${tm.state.serverConfig.game}`
    + `&zone=${tm.state.serverConfig.zone}`
    + `&nation=${tm.utils.countryToCode(tm.state.serverConfig.zone)}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    return res
  }
  const json: any = getJson(await res.text())
  authCode = json?.result?.authcode[0]
  apiUrl = json?.result?.api_url[0]
}

const receiveVotes = async (login: string): Promise<void> => {
  if (isConnected === false) { return }
  newVotes.length = 0
  playerVotes.length = 0
  const url: string = `${apiUrl}`
    + `?Action=Get`
    + `&login=${tm.state.serverConfig.login}`
    + `&authcode=${authCode}`
    + `&uid=${tm.maps.current.id}`
    + `&map=${Buffer.from(tm.maps.current.name).toString('base64')}`
    + `&author=${tm.maps.current.author}`
    + `&env=${tm.maps.current.environment}`
    + `&player=${login}`
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(res.message)
    return
  }
  const json: any = getJson(await res.text())
  mapKarmaValue = json?.result?.votes?.[0]?.karma?.[0]
  for (const key of Object.keys(mapKarma)) {
    mapKarma[key as keyof typeof mapKarma] = Number(json?.result?.votes?.[0]?.[key]?.[0]?.$?.count)
  }
  const vote: number = Number(json?.result?.players[0]?.player[0]?.$?.vote)
  const v: number | undefined = [-3, -2, -1, 1, 2, 3].find(a => a === vote)
  if (v === undefined) {
    return
  }
  storePlayerVotes((json?.result?.players[0]?.player[0]?.$?.login).toString(), vote as any)
  //Logger.debug(`curr. map maniakarma stats`, `mk api url: ` + apiUrl, `mk api authcode: ` + authCode, `mk karma value: ` + _mapKarmaValue.toString(), `mk vote stats: ` + JSON.stringify(_mapKarma))
  await fixCoherence()
}

const sendVotes = async (): Promise<void | Error> => {
  const url: string = `${apiUrl}`
    + `?Action=Vote`
    + `&login=${tm.state.serverConfig.login}`
    + `&authcode=${authCode}`
    + `&uid=${tm.maps.current.id}`
    + `&map=${Buffer.from(tm.maps.current.name).toString('base64')}`
    + `&author=${tm.maps.current.author}`
    + `&atime=${tm.maps.current.authorTime}`
    + `&ascore=0` // TODO STUNTS MODE IDC
    + `&nblaps=${tm.maps.current.lapsAmount}`
    + `&nbchecks=${tm.maps.current.checkpointsAmount}`
    + `&mood=${tm.maps.current.mood}`
    + `&env=${tm.maps.current.environment}`
    + `&votes=${getVoteString()}`
    + `&tmx=` // LEFTOVER FROM TM2
  const res = await fetch(url).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(res.message)
    return
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
  const v: MKVote = { mapId: mapId, login: login, vote: vote }
  newVotes.push(v)
  const prevVote: MKVote | undefined = playerVotes.find(a => a.login === login && a.mapId === mapId)
  const voteNames: string[] = ['waste', 'poor', 'bad', 'good', 'beautiful', 'fantastic'];
  (mapKarma as any)[voteNames[vote > 0 ? vote + 2 : vote + 3]]++
  if (prevVote === undefined) {
    playerVotes.push(v)
  } else {
    (mapKarma as any)[voteNames[prevVote.vote > 0 ? prevVote.vote + 2 : prevVote.vote + 3]]--
    prevVote.vote = vote
  }
  const voteValues = { waste: 0, poor: 20, bad: 40, good: 60, beautiful: 80, fantastic: 100 }
  const count = Object.values(mapKarma).reduce((acc, cur) => acc + cur, 0)
  mapKarmaValue = Object.entries(mapKarma).map(a => (voteValues as any)[a[0]] * a[1]).reduce((acc, cur) => acc + cur, 0) / count
}

const fixCoherence = async (): Promise<void> => {
  const localVotes: TMVote[] = tm.karma.current
  const mkVotes: MKVote[] = playerVotes
  for (const e of mkVotes) {
    if (!localVotes.some(a => a.login === e.login && a.vote === e.vote)) {
      //  await VoteService.add( e.login, e.vote)
    }
  }
  for (const e of localVotes) {
    if (!mkVotes.some(a => a.login === e.login && a.vote === e.vote)) {
      addVote(e.mapId, e.login, e.vote)
    }
  }
}

const onBeginMap = async (isRestart: boolean) => {
  await sendVotes()
  if (isRestart === false) {
    for (const player of tm.players.list) {
      await receiveVotes(player.login)
    }
  }
  //Events.emitEvent('Controller.ManiakarmaVotes', { votes: _mapKarma, karma: _mapKarmaValue })
}

if (config.isEnabled === true) {
  tm.addListener('Controller.Ready', () => {
    void initialize()
  })
  tm.addListener('Controller.PlayerJoin', (info): void => {
    void receiveVotes(info.login)
  })
  tm.addListener('Controller.BeginMap', (info): void => {
    void onBeginMap(info.isRestart)
  })
}