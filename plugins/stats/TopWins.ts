import { trakman as tm } from "../../src/Trakman.js";
import config from './Config.js'

let topList: { login: string, nickname: string, wins: number }[] = []

const updateListeners: ((updatedLogin: string, list: { login: string, nickname: string, wins: number }[]) => void)[] = []

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

tm.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

tm.addListener('Controller.EndMap', (info) => {
  const login = info.winnerLogin
  const wins = info.winnerWins
  if (wins === undefined || login === undefined
    || wins <= topList[topList.length - 1].wins) { return }
  const entry = topList.find(a => a.login === login)
  if (entry !== undefined) {
    entry.wins = wins
    topList.sort((a, b) => b.wins - a.wins)
  } else {
    topList.splice(topList.findIndex(a => a.wins < wins), 1)
    topList.length = config.winsCount
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
  }

}