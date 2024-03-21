import config from './Config.js'

let topList: { readonly login: string, nickname: string, amount: number }[] = []
let onlineList: { readonly login: string, nickname: string, amount: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, amount: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []

const initialize = async () => {
  const mapIds = await tm.db.getMapId(tm.maps.list.map(a => a.id))
  const res: { readonly login: string, nickname: string, amount: number }[] | Error =
    await tm.db.query(`WITH r(player_id, map_id) AS
    (SELECT player_id, map_id FROM records WHERE map_id IN(${
      // Use only map ids in the current maplist
      mapIds.map(a => `${a.id},`).join('').slice(0, -1)}))
  SELECT count(*)::int as amount, nickname, login FROM r
  JOIN players ON players.id=r.player_id
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
  for (const e of updateListeners) { e(topList) }
  for (const e of nicknameChangeListeners) { e(topList) }
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
    const id = await tm.db.getPlayerId(logins)
    if (id === undefined) { return }
    const mapIds = await tm.db.getMapId(tm.maps.list.map(a => a.id))
    const res = await tm.db.query(`WITH r(player_id, map_id) AS
      (SELECT player_id, map_id FROM records WHERE map_id IN(${mapIds.map(a => `${a.id},`).join('').slice(0, -1)}))
    SELECT count(*)::int as amount, nickname FROM r
    JOIN players ON players.id=r.player_id
    WHERE player_id=$1
    GROUP BY (nickname, login, last_online)`, id)
    if (res instanceof Error) {
      tm.log.error(`Failed to get record count info for player ${logins}`, res.message, res.stack)
      return
    }
    if (res[0] === undefined) {
      const player = await tm.players.fetch(logins)
      if (player === undefined) { return }
      return { login: player.login, nickname: player.nickname, amount: 0 }
    }
    return { login: logins, nickname: res[0].nickname, amount: res[0].amount }
  }
  const ids = await tm.db.getPlayerId(logins)
  if (ids.length === 0) { return [] }
  const mapIds = await tm.db.getMapId(tm.maps.list.map(a => a.id))
  const res = await tm.db.query(`WITH r(player_id, map_id) AS
    (SELECT player_id, map_id FROM records WHERE map_id IN(${mapIds.map(a => `${a.id}, `).join('').slice(0, -2)}))
  SELECT login, count(*)::int as amount, nickname FROM r
  JOIN players ON players.id=r.player_id
  WHERE ${logins.map((a, i) => `player_id=$${i + 1} OR `).join('').slice(0, -3)}
  GROUP BY (nickname, login, last_online)
  ORDER BY amount DESC`, ...ids.map(a => a.id))
  if (res instanceof Error) {
    tm.log.error(`Failed to get record count info for players ${logins.join(',')}`, res.message, res.stack)
    return []
  }
  const ret = res.map(a => ({ login: a.login, nickname: a.nickname, amount: a.amount }))
  for (const e of logins) {
    if (!ret.some(a => a.login === e)) {
      const player = await tm.players.fetch(e)
      if (player !== undefined) { ret.push({ login: e, nickname: player.nickname, amount: 0 }) }
    }
  }
  return ret
}

tm.addListener('Startup', (): void => void initialize())

tm.addListener('MatchSettingsUpdated', () => void initialize())

tm.addListener('PlayerJoin', async info => {
  const data = await getFromDB(info.login)
  if (data !== undefined) { onlineList.push(data) }
})

tm.addListener('PlayerLeave', info => {
  onlineList = onlineList.filter(a => a.login !== info.login)
})

tm.addListener('LocalRecord', info => {
  if (info.previous === undefined) {
    const obj = onlineList.find(a => a.login === info.login)
    if (obj === undefined) { return }
    obj.amount++
    if (topList.length !== 0 && topList.length >= config.recordsCount &&
      obj.amount <= topList[topList.length - 1].amount) { return }
    const entry = topList.find(a => a.login === info.login)
    if (entry !== undefined) {
      entry.amount = obj.amount
      topList.sort((a, b) => b.amount - a.amount)
    } else {
      topList.push(obj)
      topList.sort((a, b) => b.amount - a.amount)
      topList.length = Math.min(config.recordsCount, topList.length)
    }
    for (const e of updateListeners) {
      e([obj])
    }
  }
})

tm.addListener(['MapAdded', 'MapRemoved'], () => {
  topList = []
  onlineList = []
  initialize()
})

/**
 * Creates and provides utilities for accessing players record count ranking
 * @author lythx
 * @since 0.3
 */
export const topRecords = {

  /**
   * List of players sorted by their record count
   */
  get list(): readonly Readonly<{ login: string, nickname: string, amount: number }>[] {
    return topList
  },

  /**
   * List of currently online players sorted by their record count
   */
  get onlineList(): readonly Readonly<{ login: string, nickname: string, amount: number }>[] {
    return onlineList
  },

  /**
   * Add a callback function to execute on top records list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, amount: number }>[]) => void): void {
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