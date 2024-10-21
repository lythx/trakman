import config from './Config.js'
import type { NewUltimaniaRecord as NewUltiRecord, UltimaniaRecord as UltiRecord } from './UltimaniaTypes.js'
import { sendRecord, updatePlayer, fetchRecords } from './UltimaniaClient.js'
import './ui/UltiRecords.component.js'

let currentUltis: UltiRecord[] = []
let newUltis: UltiRecord[] = []

const recordListeners: ((record: NewUltiRecord) => void)[] = []
const fetchListeners: ((ultis: UltiRecord[]) => void)[] = []
const nicknameUpdateListeners: ((ultis: UltiRecord[]) => void)[] = []

const emitRecordEvent = (record: NewUltiRecord): void => {
  for (const e of recordListeners) { e(record) }
}

const emitFetchEvent = (ultis: UltiRecord[]): void => {
  for (const e of fetchListeners) { e(ultis) }
}

const emitNicknameUpdateEvent = (updatedRecords: UltiRecord[]): void => {
  for (const e of nicknameUpdateListeners) { e(updatedRecords) }
}

const initialize = async (): Promise<void> => {
  const records = await fetchRecords(tm.maps.current.id)
  if (!(records instanceof Error)) {
    currentUltis = records
  }
  for (const e of tm.players.list) {
    const status = await updatePlayer(e)
    if (status instanceof Error) { break }
  }
  tm.log.trace('Connected to Ultimania')
  emitFetchEvent(currentUltis)
  if (config.syncName) {
    void tm.updatePlayerInfo(...currentUltis)
  }
}

const addRecord = (player: Omit<tm.Player, 'currentCheckpoints' | 'isSpectator' | 'isTemporarySpectator' | 'isPureSpectator'>,
  score: number, date: Date): UltiRecord | false => {
  const pb: number | undefined = currentUltis.find(a => a.login === player.login)?.score
  const position: number = currentUltis.filter(a => a.score >= score).length + 1
  if (score < (pb ?? -1)) { return false }
  if (pb === undefined) {
    const ultiRecordInfo: NewUltiRecord = constructRecordObject(player, score, undefined, position, undefined, date)
    currentUltis.splice(position - 1, 0,
      {
        login: player.login, score, nickname: player.nickname, date
      })
    newUltis.push({
      login: player.login, score, nickname: player.nickname, date
    })
    tm.log.info(getLogString(undefined, position, undefined, score, player))
    emitRecordEvent(ultiRecordInfo)
    return {
      login: player.login,
      nickname: player.nickname,
      score: score,
      date
    }
  } else if (score === pb) {
    const previousPosition: number = currentUltis.findIndex(a => a.login === player.login) + 1
    const ultiRecordInfo: NewUltiRecord = constructRecordObject(player, score, score, previousPosition, previousPosition, date)
    tm.log.info(getLogString(previousPosition, previousPosition, score, score, player))
    emitRecordEvent(ultiRecordInfo)
    return {
      login: player.login,
      nickname: player.nickname,
      score: score,
      date
    }
  } else if (score > pb) {
    const previousIndex: number = currentUltis.findIndex(a => a.login === player.login)
    const previousScore: number = currentUltis[previousIndex].score
    if (previousScore === undefined) { // not sure if this is needed
      tm.log.error(`Can't find player ${player.login} in memory`)
      return false
    }
    const ultiRecordInfo: NewUltiRecord = constructRecordObject(player, score, previousScore,
      position, currentUltis.findIndex(a => a.login === player.login) + 1, date)
    currentUltis = currentUltis.filter(a => a.login !== player.login)
    currentUltis.splice(position - 1, 0,
      {
        login: player.login, score, nickname: player.nickname, date
      })
    newUltis = newUltis.filter(a => a.login !== player.login)
    newUltis.push({
      login: player.login, score, nickname: player.nickname, date
    })
    tm.log.info(getLogString(previousIndex + 1, position, previousScore, score, player))
    emitRecordEvent(ultiRecordInfo)
    return {
      login: player.login,
      nickname: player.nickname,
      score: score,
      date
    }
  }
  return false
}

const constructRecordObject = (player: Omit<tm.Player, 'currentCheckpoints' | 'isSpectator' | 'isTemporarySpectator' | 'isPureSpectator'>,
  score: number, previousScore: number | undefined, position: number, previousPosition: number | undefined, date: Date): NewUltiRecord => {
  return {
    ...player,
    score,
    position,
    previous: (previousScore && previousPosition) ? { score: previousScore, position: previousPosition } : undefined,
    date
  }
}

const getLogString = (previousPosition: number | undefined, position: number,
  previousTime: number | undefined, time: number, player: { login: string, nickname: string }): string[] => {
  const rs = tm.utils.getRankingString({ position, time }, (previousPosition && previousTime) ?
    { time: previousTime, position: previousPosition } : undefined)
  return [`${tm.utils.strip(player.nickname)} (${player.login}) has ${rs.status} the ${tm.utils.getOrdinalSuffix(position)} ultimania record. Score: ${tm.utils.getTimeString(time)}${rs.difference !== undefined ? ` (+${rs.difference})` : ``}`]
}

if (config.isEnabled) {

  tm.addListener('Startup', (): void => {
    if (tm.getGameMode() !== 'Stunts') {
      return
    }
    tm.log.trace('Connecting to Ultimania...')
    void initialize()
  })

  tm.addListener('BeginMap', async (info) => {
    newUltis = []
    currentUltis = []
    if (tm.getGameMode() !== 'Stunts') {
      return
    }
    const records = await fetchRecords(info.id)
    if (!(records instanceof Error)) {
      currentUltis = records
    }
    emitFetchEvent(currentUltis)
    if (config.syncName) {
      void tm.updatePlayerInfo(...currentUltis)
    }
  })

  tm.addListener('LiveRecord', (info) => {
    if (tm.getGameMode() !== 'Stunts') {
      return
    }
    const record = addRecord(info, info.time, new Date())
    if (record !== false) {
      sendRecord(tm.maps.current.id, record)
    }
  })

  tm.addListener('PlayerJoin', (player) => {
    updatePlayer(player)
  })

  tm.addListener('PlayerDataUpdated', (info): void => {
    const changedObjects: UltiRecord[] = []
    for (const e of currentUltis) {
      const newNickname: string | undefined = info.find(a => a.login === e.login)?.nickname
      if (newNickname !== undefined) {
        if (e.nickname !== newNickname) {
          tm.log.trace(`Updated nickname for ${tm.utils.strip(newNickname)} (${e.login}) from Ultimania.`)
          e.nickname = newNickname
          changedObjects.push(e)
        }
      }
    }
    if (changedObjects.length !== 0) {
      emitNicknameUpdateEvent(changedObjects)
    }
  })

}

/**
 * Gets the players ultimania record
 * @param login Player login
 * @returns Ultimania record object or undefined if the player doesn't have a ultimania record
 */
function getRecord(login: string): UltiRecord | undefined
/**
 * Gets multiple ultimania records
 * Returned array is sorted by position
 * @param logins Array of player logins
 * @returns Array of ultimania record objects
 */
function getRecord(logins: string[]): UltiRecord[]
function getRecord(logins: string | string[]): UltiRecord | UltiRecord[] | undefined {
  if (typeof logins === 'string') {
    return currentUltis.find(a => a.login === logins)
  }
  return currentUltis.filter(a => logins.includes(a.login))
}

/**
 * Gets the players new ultimania record
 * @param login Player login
 * @returns Ultimania record object or undefined if the player didn't get a new ultimania record
 */
function getNewRecord(login: string): UltiRecord | undefined
/**
 * Gets multiple new ultimania records
 * Returned array is sorted by position
 * @param logins Array of player logins
 * @returns Array of ultimania record objects
 */
function getNewRecord(logins: string[]): UltiRecord[]
function getNewRecord(logins: string | string[]): UltiRecord | UltiRecord[] | undefined {
  if (typeof logins === 'string') {
    return newUltis.find(a => a.login === logins)
  }
  return newUltis.filter(a => logins.includes(a.login))
}

/**
 * Fetches and sends ultimania records.
 * Provides utilities for accessing ultimania records related data.
 * @author lythx & wiseraven
 * @since 0.1
 */
export const ultimania = {

  /**
   * Add a callback function to execute on a ultimania record
   * @param callback Function to execute on event. It takes new record object as a parameter
   */
  onRecord(callback: ((record: Readonly<NewUltiRecord>) => void)): void {
    recordListeners.push(callback)
  },

  /**
   * Add a callback function to execute when ultimania records get fetched
   * @param callback Function to execute on event. It takes record objects array as a parameter
   */
  onFetch(callback: ((ultis: Readonly<Readonly<UltiRecord>[]>) => void)): void {
    fetchListeners.push(callback)
  },

  /**
   * Add a callback function to execute when player nickname in ultimania records gets updated
   * @param callback Function to execute on event. It takes changed record objects array as a parameter
   */
  onNicknameUpdate(callback: ((ultis: Readonly<Readonly<UltiRecord>[]>) => void)): void {
    nicknameUpdateListeners.push(callback)
  },

  getRecord,

  getNewRecord,

  /**
   * Current map ultimania records sorted by position
   */
  get records(): Readonly<UltiRecord>[] {
    return [...currentUltis]
  },

  /**
   * New ultimania records sorted by position
   */
  get newRecords(): Readonly<UltiRecord>[] {
    return [...newUltis]
  },

  /**
   * Number of ultimania records
   */
  get recordCount(): number {
    return currentUltis.length
  },

  /**
   * Number of new ultimania records
   */
  get newRecordCount(): number {
    return newUltis.length
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled,

}

export type { NewUltiRecord, UltiRecord }
