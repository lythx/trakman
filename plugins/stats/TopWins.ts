
import config from './Config.js'

let topList: { login: string, nickname: string, wins: number }[] = []
const updateListeners: ((updatedLogin: string, list: { login: string, nickname: string, wins: number }[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, wins FROM players
  ORDER BY wins DESC,
  last_online DESC
  LIMIT ${config.winsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top wins', res.message, res.stack)
    return
  }
  topList = res
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
})

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

tm.addListener('EndMap', async (info) => {
  const login = info.winnerLogin
  const wins = info.winnerWins
  if (wins === undefined || login === undefined
    || wins <= topList[topList.length - 1].wins) { return }
  const entry = topList.find(a => a.login === login)
  if (entry !== undefined) {
    entry.wins = wins
    topList.sort((a, b) => b.wins - a.wins)
  } else {
    let nickname = tm.players.get(login)?.nickname
    if (nickname === undefined) {
      nickname = (await tm.players.fetch(login))?.nickname
    }
    topList.splice(topList.findIndex(a => a.wins < wins), 0, { login, wins, nickname: nickname ?? login })
    topList.length = Math.min(config.winsCount, topList.length)
  }
  for (const e of updateListeners) {
    e(login, [...topList])
  }
})

export const topWins = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogin: string, list: { login: string, nickname: string, wins: number }[]) => void) {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on donator nickname change
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onNicknameChange(callback: (changes: { login: string, nickname: string }[]) => void) {
    nicknameChangeListeners.push(callback)
  }

}