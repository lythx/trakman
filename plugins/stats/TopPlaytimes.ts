import config from './Config.js'

let topList: { readonly login: string, nickname: string, playtime: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, playtime: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []
let interval: NodeJS.Timeout

const initialize = async () => {
  const res: { login: string, nickname: string, playtime: number }[] | Error =
    await tm.db.query(`SELECT login, nickname, time_played AS playtime FROM players
  ORDER BY time_played DESC,
  last_online DESC
  LIMIT ${config.playtimesCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top playtimes', res.message, res.stack)
    return
  }
  for (const e of res) { e.playtime = e.playtime * 1000 } // Change playtime to milliseconds
  topList = res
  for (const e of updateListeners) { e(topList) }
  for (const e of nicknameChangeListeners) { e(topList) }
  clearInterval(interval)
  interval = setInterval(update, config.playtimesUpdateInterval)
}

const update = async () => {
  const players = tm.players.list
  const updated: typeof topList = []
  for (const e of players) {
    const pt = e.timePlayed + Date.now() - e.joinTimestamp
    if (topList.length !== 0 && topList.length >= config.playtimesCount &&
      pt <= topList[topList.length - 1].playtime) { return }
    const entry = topList.find(a => a.login === e.login)
    if (entry !== undefined) {
      entry.playtime = pt
      updated.push(entry)
      topList.sort((a, b) => b.playtime - a.playtime)
    } else {
      const obj = { login: e.login, nickname: e.nickname, playtime: pt }
      updated.push(obj)
      topList.push(obj)
      topList.sort((a, b) => b.playtime - a.playtime)
      topList.length = Math.min(config.playtimesCount, topList.length)
    }
  }
  for (const e of updateListeners) { e(updated) }
}

tm.addListener('PlayerDataUpdated', (info) => {
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

tm.addListener('Startup', (): void => void initialize())

tm.addListener('EndMap', () => {
  update()
})


/**
 * Creates and provides utilities for accessing players playtime ranking
 * @author lythx
 * @since 0.3
 */
export const topPlaytimes = {

  /**
   * List of players sorted by their total playtime
   */
  get list(): readonly Readonly<{ login: string, nickname: string, playtime: number }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top playtimes list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, playtime: number }>[]) => void): void {
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