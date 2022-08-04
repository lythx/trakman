import { TRAKMAN as TM } from "../src/Trakman.js";

const voteCounts: { login: string, count: number }[] = []
const initialVotes: TMVote[] = []
const topVoteCounts: { login: string, count: number }[] = []
const updateListeners: (() => void)[] = []
const topUpdateListeners: (() => void)[] = []

TM.addListener('Controller.Ready', async () => {
  const allPlayers = await TM.queryDB(`SELECT players.id, login FROM players
  JOIN player_ids ON player_ids.id=players.id`)
  if (allPlayers instanceof Error) {
    return
  }
  const allVoteCounts: { login: string, count: number }[] = []
  for (const e of allPlayers) {
    const res = await TM.queryDB(`SELECT count(*) FROM VOTES
    WHERE player_id=$1`, e.id)
    if (res instanceof Error) {
      TM.error(`Failed to fetch vote count for player ${e.login}`, res.message, res.stack)
      return
    }
    allVoteCounts.push({ login: e.login, count: Number(res[0].count) })
  }
  allVoteCounts.sort((a, b) => b.count - a.count)
  topVoteCounts.push(...allVoteCounts.slice(0, 10))
  for (const e of TM.players) {
    voteCounts.push({ login: e.login, count: allVoteCounts.find(a => a.login === e.login)?.count ?? 0 })
  }
})

TM.addListener('Controller.EndMap', () => {
  initialVotes.length = 0
  initialVotes.push(...TM.votes.filter(a => a.mapId === TM.mapQueue[0].id))
})

TM.addListener('Controller.KarmaVote', (info) => {
  if (!initialVotes.some(a => a.login === info.login)) {
    initialVotes.push(info)
    const count = voteCounts.find(a => a.login === info.login)
    if (count === undefined) { return }
    count.count++
    const topIndex = topVoteCounts.findIndex(a => a.login === info.login)
    if (topIndex === -1 && count.count > topVoteCounts[topVoteCounts.length - 1].count) {
      topVoteCounts.splice(topVoteCounts.findIndex(a => a.count < count.count), 0, count)
      topVoteCounts.length = 10
      for (const e of topUpdateListeners) {
        e()
      }
    } else if (topIndex !== -1) {
      const newIndex = topVoteCounts.findIndex(a => a.count < count.count)
      if (newIndex < topIndex) {
        topVoteCounts.splice(topIndex, 1)
        topVoteCounts.splice(newIndex, 0, count)
        for (const e of topUpdateListeners) {
          e()
        }
      } else {
        topVoteCounts[topIndex].count++
        for (const e of topUpdateListeners) {
          e()
        }
      }
    }
    for (const e of updateListeners) {
      e()
    }
  }
})

TM.addListener('Controller.PlayerJoin', async (info) => {
  const id = await TM.getPlayerDBId(info.login)
  const res = await TM.queryDB(`SELECT count(*) FROM VOTES
      WHERE player_id=$1`, id)
  if (res instanceof Error) {
    TM.error(`Failed to fetch vote count for player ${info.login}`, res.message, res.stack)
    return
  }
  voteCounts.push({ login: info.login, count: Number(res[0].count) })
})

TM.addListener('Controller.PlayerLeave', async (info) => {
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