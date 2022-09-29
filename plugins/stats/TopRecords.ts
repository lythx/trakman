
import config from './Config.js'

let topList: { readonly login: string, nickname: string, amount: number }[] = []
let onlineList: { readonly login: string, nickname: string, amount: number }[] = []
const listeners: ((updatedLogin: string, list: Readonly<{ login: string, nickname: string, amount: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT count(*)::int as amount, nickname, login FROM records
  JOIN players ON players.id=records.player_id
  GROUP BY (nickname, login, last_online)
  ORDER BY amount DESC,
  last_online DESC
  LIMIT ${config.recordsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top records', res.message, res.stack)
    return
  }
  topList = res
  onlineList = await getFromDB(tm.players.list.map(a => a.login))
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
  for (const e of onlineList) {
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

async function getFromDB(login: string): Promise<{ login: string, nickname: string, amount: number } | undefined>
async function getFromDB(logins: string[]): Promise<{ login: string, nickname: string, amount: number }[]>
async function getFromDB(logins: string | string[]):
  Promise<{ login: string, nickname: string, amount: number } | undefined |
    { login: string, nickname: string, amount: number }[]> {
  if (typeof logins === 'string') {
    const id = await tm.getPlayerDBId(logins)
    if (id === undefined) { return }
    const res = await tm.db.query(`SELECT count(*)::int as amount, nickname FROM records
    JOIN players ON players.id=records.player_id
    WHERE player_id=$1
    GROUP BY (nickname, login, last_online)`, id)
    if (res instanceof Error) {
      tm.log.error(`Failed to get record count info for player ${logins}`, res.message, res.stack)
      return
    }
    if (res[0] === undefined) { return undefined }
    return { login: logins, nickname: res[0].nickname, amount: res[0].amount }
  }
  const ids = await tm.getPlayerDBId(logins)
  if (ids.length === 0) { return [] }
  const res = await tm.db.query(`SELECT login, count(*)::int as amount, nickname FROM records
  JOIN players ON players.id=records.player_id
  WHERE ${logins.map((a, i) => `player_id=$${i + 1} OR `).join('').slice(0, -3)}
  GROUP BY (nickname, login, last_online)
  ORDER BY amount DESC`, ...ids.map(a => a.id))
  if (res instanceof Error) {
    tm.log.error(`Failed to get record count info for players ${logins.join(',')}`, res.message, res.stack)
    return []
  }
  return res.map(a => ({ login: a.login, nickname: a.nickname, amount: a.amount }))
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
})

tm.addListener('PlayerJoin', async info => {
  const data = await getFromDB(info.login)
  if (data !== undefined) { onlineList.push(data) }
})

tm.addListener('PlayerLeave', async info => {
  onlineList = onlineList.filter(a => a.login !== info.login)
})

tm.addListener('LocalRecord', info => {
  if (info.previousPosition === -1) {
    const obj = onlineList.find(a => a.login === info.login)
    if (obj === undefined) { return }
    obj.amount++
    if (obj.amount <= topList[topList.length - 1].amount) { return }
    const entry = topList.find(a => a.login === info.login)
    if (entry !== undefined) {
      entry.amount = obj.amount
      topList.sort((a, b) => b.amount - a.amount)
    } else {
      topList.splice(topList.findIndex(a => a.amount < obj.amount), 0, { ...obj })
      topList.length = Math.min(config.recordsCount, topList.length)
    }
    for (const e of listeners) {
      e(info.login, [...topList])
    }
  }
})

export const topRecords = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogin: string, list: Readonly<{ login: string, nickname: string, amount: number }>[]) => void) {
    listeners.push(callback)
  },

  /**
   * Add a callback function to execute on donator nickname change
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onNicknameChange(callback: (changes: { login: string, nickname: string }[]) => void) {
    nicknameChangeListeners.push(callback)
  }

}