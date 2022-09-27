
import config from './Config.js'

let topList: { login: string, nickname: string, visits: number }[] = []
const updateListeners: ((updatedLogin: string, list: { login: string, nickname: string, visits: number }[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, visits FROM players
  ORDER BY visits DESC,
  last_online DESC
  LIMIT ${config.visitsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top visits', res.message, res.stack)
    return
  }
  topList = res
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
})

tm.addListener('PlayerJoin', (info) => {
  const login = info.login
  const visits = info.visits
  if (visits <= topList[topList.length - 1].visits) { return }
  const entry = topList.find(a => a.login === login)
  if (entry !== undefined) {
    entry.visits = visits
    topList.sort((a, b) => b.visits - a.visits)
  } else {
    topList.splice(topList.findIndex(a => a.visits < visits), 0, { login, visits, nickname: info.nickname })
    topList.length = config.visitsCount
  }
  for (const e of updateListeners) {
    e(login, [...topList])
  }
})

export const topVisits = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogin: string, list: { login: string, nickname: string, visits: number }[]) => void) {
    updateListeners.push(callback)
  }

}