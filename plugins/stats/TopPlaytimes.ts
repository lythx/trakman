
import config from './Config.js'

let topList: { login: string, nickname: string, playtime: number }[] = []
const updateListeners: ((updatedLogins: string[], list: { login: string, nickname: string, playtime: number }[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, time_played AS playtime FROM players
  ORDER BY time_played DESC,
  last_online DESC
  LIMIT ${config.playtimesCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top playtimes', res.message, res.stack)
    return
  }
  topList = res.map(a => ({ ...a, playtime: a.playtime * 1000 }))
}

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

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
})

tm.addListener('EndMap', () => {
  const players = tm.players.list
  for (const e of players) {
    const pt = e.timePlayed + Date.now() - e.joinTimestamp
    if (pt <= topList[topList.length - 1].playtime) { return }
    const entry = topList.find(a => a.login === e.login)
    if (entry !== undefined) {
      entry.playtime = pt
      topList.sort((a, b) => b.playtime - a.playtime)
    } else {
      topList.splice(topList.findIndex(a => a.playtime < pt), 0, { login: e.login, nickname: e.nickname, playtime: pt })
      topList.length = Math.min(config.playtimesCount, topList.length)
    }
  }
  for (const e of updateListeners) {
    e(players.map(a => a.login), [...topList])
  }
})

export const topPlaytimes = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogins: string[], list: { login: string, nickname: string, playtime: number }[]) => void) {
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