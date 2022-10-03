import config from './Config.js'

let topList: { login: string, nickname: string, average: number }[] = []
const updateListeners: ((updatedLogins: string[], list: { login: string, nickname: string, average: number }[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []

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

tm.addListener('RanksAndAveragesUpdated', async (info) => {
  const updated: string[] = []
  for (const e of info) {
    updated.push(e.login)
    if (e.average >= topList[topList.length - 1].average) { return }
    const entry = topList.find(a => a.login === e.login)
    if (entry !== undefined) {
      entry.average = e.average
      topList.sort((a, b) => a.average - b.average)
    } else {
      let nickname = tm.players.get(e.login)?.nickname
      if (nickname === undefined) {
        nickname = (await tm.players.fetch(e.login))?.nickname
      }
      topList.splice(topList.findIndex(a => a.average > e.average), 0,
        { login: e.login, nickname: nickname ?? e.login, average: e.average })
      topList.length = Math.min(config.averagesCount, topList.length)
    }
  }
  for (const e of updateListeners) {
    e(updated, [...topList])
  }
})

export const topAverages = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogins: string[], list: { login: string, nickname: string, average: number }[]) => void) {
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