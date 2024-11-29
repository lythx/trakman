import config from './Config.js'

let topList: { readonly login: string, nickname: string, average: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, average: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []

const initialize = async () => {
  const res: { login: string, nickname: string, average: number }[] | Error =
    await tm.db.query(`SELECT login, nickname, average FROM players
  ORDER BY average ASC,
  last_online DESC
  LIMIT ${config.averagesCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top averages', res.message, res.stack)
    return
  }
  topList = res.filter(a => a.average !== tm.records.maxLocalsAmount)
  for (const e of updateListeners) { e(topList) }
  for (const e of nicknameChangeListeners) { e(topList) }
}

tm.addListener('Startup', (): void => void initialize(), true)

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

tm.addListener('RanksAndAveragesUpdated', async (info) => {
  const updated: typeof topList = []
  for (const e of info) {
    if (topList.length !== 0 && topList.length >= config.averagesCount &&
      e.average >= topList[topList.length - 1].average) { return }
    const entry = topList.find(a => a.login === e.login)
    if (entry !== undefined) {
      entry.average = e.average
      updated.push(entry)
      topList.sort((a, b) => a.average - b.average)
    } else {
      const nickname: string | undefined = tm.players.get(e.login)?.nickname ?? (await tm.players.fetch(e.login))?.nickname
      const obj = { login: e.login, nickname: nickname ?? e.login, average: e.average }
      updated.push(obj)
      topList.push(obj)
      topList.sort((a, b) => a.average - b.average)
      topList.length = Math.min(config.averagesCount, topList.length)
    }
  }
  for (const e of updateListeners) { e(updated) }
})

tm.addListener(['MapAdded', 'MapRemoved'], () => {
  topList = []
  initialize()
})

/**
 * Creates and provides utilities for accessing players average rank ranking
 * @author lythx
 * @since 0.3
 */
export const topAverages = {

  /**
   * List of players sorted by their average server rank
   */
  get list(): readonly Readonly<{ login: string, nickname: string, average: number }>[] {
    return topList
  },

  /**
  * Add a callback function to execute on top averages list update
  * @param callback Function to execute on event. It takes an array of updated objects as a parameter
  */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, average: number }>[]) => void): void {
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