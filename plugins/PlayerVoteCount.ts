import { TRAKMAN as TM } from "../src/Trakman.js";

const voteCounts: { login: string, count: number }[] = []
const initialVotes: TMVote[] = []
const topVoteCounts: { login: string, count: number }[] = []
const updateListeners: (() => void)[] = []
const topUpdateListeners: (() => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await TM.db.query(`select p.login, count(p.id)::int
  from votes v
  join player_ids p on v.player_id = p.id
  group by p.login
  order by count desc
  limit 10;`)
  if (res instanceof Error) { return }
  topVoteCounts.push(...res)
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

TM.addListener('Controller.EndMap', (): void => {
  initialVotes.length = 0
  initialVotes.push(...TM.votes.filter(a => a.mapId === TM.mapQueue[0].id))
})

TM.addListener('Controller.KarmaVote', (info): void => {
  if (!initialVotes.some(a => a.login === info.login)) {
    initialVotes.push(info)
    const count = voteCounts.find(a => a.login === info.login)
    if (count === undefined) { return }
    count.count++
    const topIndex: number = topVoteCounts.findIndex(a => a.login === info.login)
    if (topIndex === -1 && count.count > topVoteCounts[topVoteCounts.length - 1].count) {
      topVoteCounts.splice(topVoteCounts.findIndex(a => a.count < count.count), 0, count)
      topVoteCounts.length = 10
      for (const e of topUpdateListeners) {
        e()
      }
    } else if (topIndex !== -1) {
      const newIndex: number = topVoteCounts.findIndex(a => a.count < count.count)
      if (newIndex < topIndex) {
        topVoteCounts.splice(topIndex, 1)
        topVoteCounts.splice(newIndex, 0, count)
      } else {
        topVoteCounts[topIndex].count++
      }
      for (const e of topUpdateListeners) {
        e()
      }
    }
    for (const e of updateListeners) {
      e()
    }
  }
})

TM.addListener('Controller.PlayerJoin', async (info): Promise<void> => {
  const id: number | undefined = await TM.getPlayerDBId(info.login)
  const res: any[] | Error = await TM.db.query(`SELECT count(*) FROM VOTES
      WHERE player_id=$1`, id)
  if (res instanceof Error) {
    TM.error(`Failed to fetch vote count for player ${info.login}`, res.message, res.stack)
    return
  }
  voteCounts.push({ login: info.login, count: Number(res[0].count) })
})

TM.addListener('Controller.PlayerLeave', async (info): Promise<void> => {
  voteCounts.splice(voteCounts.findIndex(a => a.login === info.login), 1)
})

export const PlayerVoteCount = {

  get voteCounts() {
    return [...voteCounts]
  },

  get topVoteCounts() {
    return [...topVoteCounts]
  },

  getVoteCount(login: string): number | undefined {
    return voteCounts.find(a => a.login === login)?.count
  },

  onVoteCountUpdated(callback: () => void) {
    updateListeners.push(callback)
  },

  onTopVoteCountUpdated(callback: () => void) {
    topUpdateListeners.push(callback)
  }

}