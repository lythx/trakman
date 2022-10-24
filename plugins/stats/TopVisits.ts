import config from './Config.js'

let topList: { readonly login: string, nickname: string, visits: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, visits: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []

const initialize = async () => {
  const res: { login: string, nickname: string, visits: number }[] | Error =
    await tm.db.query(`SELECT login, nickname, visits FROM players
  ORDER BY visits DESC,
  last_online DESC
  LIMIT ${config.visitsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top visits', res.message, res.stack)
    return
  }
  topList = res
}

tm.addListener('Startup', (): void => void initialize())

tm.addListener('PlayerInfoUpdated', (info) => {
  const changedObjects: { login: string, nickname: string }[] = []
  for (const e of topList) {
    const newNickname = info.find(a => a.login === e.login)?.nickname
    if (newNickname !== undefined) {
      e.nickname = newNickname
      changedObjects.push(e)
    }
  }
  if (changedObjects.length !== 0) {
    for (const e of nicknameChangeListeners) {
      e(changedObjects)
    }
  }
})

tm.addListener('PlayerJoin', (info) => {
  const login = info.login
  const visits = info.visits
  if (topList.length !== 0 && topList.length >= config.visitsCount &&
    visits <= topList[topList.length - 1].visits) { return }
  const entry = topList.find(a => a.login === login)
  let obj: typeof topList[number]
  if (entry !== undefined) {
    entry.visits = visits
    obj = entry
    topList.sort((a, b) => b.visits - a.visits)
  } else {
    obj = { login, visits, nickname: info.nickname }
    topList.push(obj)
    topList.sort((a, b) => b.visits - a.visits)
    topList.length = Math.min(config.visitsCount, topList.length)
  }
  for (const e of updateListeners) {
    e([obj])
  }
})

/**
 * Creates and provides utilities for accessing players visit count ranking
 * @author lythx
 * @since 0.3
 */
export const topVisits = {

  /**
   * List of players sorted by their visit count
   */
  get list(): readonly Readonly<{ login: string, nickname: string, visits: number }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top visits list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, visits: number }>[]) => void): void {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on player nickname change
   * @param callback Function to execute on event. It takes an array of objects containing login and nickname as a parameter
   */
  onNicknameChange(callback: (changes: readonly Readonly<{ login: string, nickname: string }>[]) => void): void {
    nicknameChangeListeners.push(callback)
  }

}