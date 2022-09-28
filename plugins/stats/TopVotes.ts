
import config from './Config.js'

let onlineList: { login: string, nickname: string, count: number }[] = []
let initialVotes: tm.Vote[] = []
let topList: { login: string, nickname: string, count: number }[] = []
const updateListeners: ((updatedLogin: string, list: { login: string, nickname: string, count: number }[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []

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
  topList.push(...res)
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
    const count = onlineList.find(a => a.login === info.login)
    if (count === undefined) { return }
    count.count++
    const topIndex: number = topList.findIndex(a => a.login === info.login)
    if (topIndex === -1 && count.count > topList[topList.length - 1].count) {
      topList.splice(topList.findIndex(a => a.count < count.count), 0, count)
      topList.length = 10
      for (const e of updateListeners) {
        e(topList[topIndex].login, [...topList])
      }
    } else if (topIndex !== -1) {
      const newIndex: number = topList.findIndex(a => a.count < count.count)
      if (newIndex < topIndex) {
        topList.splice(topIndex, 1)
        topList.splice(newIndex, 0, count)
      } else {
        topList[topIndex].count++
      }
      for (const e of updateListeners) {
        e(topList[topIndex].login, [...topList])
      }
    }
  }
})

tm.addListener('PlayerJoin', async (info): Promise<void> => {
  const id: number | undefined = await tm.getPlayerDBId(info.login)
  const res: any[] | Error = await tm.db.query(`SELECT count(*) FROM VOTES
      WHERE player_id=$1`, id)
  if (res instanceof Error) {
    tm.log.error(`Failed to fetch vote count for player ${info.login}`, res.message, res.stack)
    return
  }
  onlineList.push({ login: info.login, nickname: info.nickname, count: Number(res[0].count) })
})

tm.addListener('PlayerLeave', async (info): Promise<void> => {
  onlineList.splice(onlineList.findIndex(a => a.login === info.login), 1)
})

export const topVotes = {

  get list() {
    return [...topList]
  },

  get(login: string): { nickname: string, count: number } | undefined {
    return topList.find(a => a.login === login)
  },

  onUpdate(callback: (updatedLogin: string, list: { login: string, nickname: string, count: number }[]) => void) {
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