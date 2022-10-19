import config from './Config.js'

let onlineList: { readonly login: string, nickname: string, count: number }[] = []
let initialVotes: tm.Vote[] = []
let topList: { readonly login: string, nickname: string, count: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, count: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, count(players.id)::int
  FROM votes
  JOIN players ON votes.player_id=players.id
  GROUP BY (login, nickname)
  ORDER BY count DESC
  LIMIT ${config.votesCount};`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top votes', res.message, res.stack)
    return
  }
  topList.push(...res.filter(a => a.count !== 0))
  for (const e of updateListeners) {
    e(topList)
  }
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
  initialVotes = tm.karma.current
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

tm.addListener('BeginMap', (): void => {
  initialVotes.length = 0
  initialVotes = tm.karma.current
})

tm.addListener('KarmaVote', (info): void => {
  if (!initialVotes.some(a => a.login === info.login)) {
    initialVotes.push(info)
    const obj = onlineList.find(a => a.login === info.login)
    if (obj === undefined) { return }
    obj.count++
    if (topList.length !== 0 && topList.length < config.votesCount &&
      obj.count <= topList[topList.length - 1].count) { return }
    const entry = topList.find(a => a.login === obj.login)
    if (entry !== undefined) {
      entry.count = obj.count
      topList.sort((a, b) => b.count - a.count)
    } else {
      topList.push(obj)
      topList.sort((a, b) => b.count - a.count)
      topList.length = Math.min(config.votesCount, topList.length)
    }
    for (const e of updateListeners) {
      e([obj])
    }
  }
})

tm.addListener('PlayerJoin', async (info): Promise<void> => {
  const id: number | undefined = await tm.db.getPlayerId(info.login)
  const res: { count: number }[] | Error = await tm.db.query(`SELECT count(*)::int FROM votes
      WHERE player_id=$1`, id)
  if (res instanceof Error) {
    tm.log.error(`Failed to fetch vote count for player ${info.login}`, res.message, res.stack)
    return
  }
  onlineList.push({ login: info.login, nickname: info.nickname, count: res[0].count })
})

tm.addListener('PlayerLeave', (info): void => {
  onlineList = onlineList.filter(a => a.login !== info.login)
})

export const topVotes = {

  /**
   * List of players sorted by their votes count
   */
  get list(): readonly Readonly<{ login: string, nickname: string, count: number }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top votes list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, count: number }>[]) => void): void {
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