import config from './Config.js'

let topList: { readonly login: string, nickname: string, wins: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, wins: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, wins FROM players
  ORDER BY wins DESC,
  last_online DESC
  LIMIT ${config.winsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top wins', res.message, res.stack)
    return
  }
  topList = res.filter(a => a.wins !== 0)
  for (const e of updateListeners) { e(topList) }
  for (const e of nicknameChangeListeners) { e(topList) }
}

tm.addListener('Startup', (): void => void initialize())

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

tm.addListener('EndMap', async (info) => {
  const login = info.winnerLogin
  const wins = info.winnerWins
  if (wins === undefined || login === undefined
    || (topList.length !== 0 && topList.length >= config.winsCount
      && wins <= topList[topList.length - 1].wins)) { return }
  const entry = topList.find(a => a.login === login)
  let obj: typeof topList[number]
  if (entry !== undefined) {
    entry.wins = wins
    obj = entry
    topList.sort((a, b) => b.wins - a.wins)
  } else {
    const nickname: string | undefined = tm.players.get(login)?.nickname ?? (await tm.players.fetch(login))?.nickname
    obj = { login, wins, nickname: nickname ?? login }
    topList.push(obj)
    topList.sort((a, b) => b.wins - a.wins)
    topList.length = Math.min(config.winsCount, topList.length)
  }
  for (const e of updateListeners) { e([obj]) }
})

/**
 * Creates and provides utilities for accessing players wins count ranking
 * @author lythx
 * @since 0.3
 */
export const topWins = {

  /**
   * List of players sorted by their wins count
   */
  get list(): readonly Readonly<{ login: string, nickname: string, wins: number }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top wins list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, wins: number }>[]) => void): void {
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