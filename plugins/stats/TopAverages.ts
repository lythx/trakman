import { trakman as tm } from "../../src/Trakman.js";
import config from './Config.js'

let topList: { login: string, nickname: string, average: number }[] = []

const updateListeners: ((updatedLogins: string[], list: { login: string, nickname: string, average: number }[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, average FROM players
  ORDER BY average ASC,
  last_online DESC
  LIMIT ${config.averagesCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top averages', res.message, res.stack)
    return
  }
  topList = res
}

tm.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

tm.addListener('Controller.RanksAndAveragesUpdated', async (info) => {
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
      topList.length = config.averagesCount
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
  }

}