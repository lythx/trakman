import { TRAKMAN as TM } from "../src/Trakman.js";

const topPlayerVisits: { login: string, visits: number }[] = []
const updateListeners: (() => void)[] = []

TM.addListener('Controller.Ready', async () => {
  const allPlayers = await TM.queryDB(`SELECT login, visits FROM players
  JOIN player_ids ON player_ids.id=players.id
  ORDER BY visits DESC,
  last_online DESC
  LIMIT 10`)
  if (allPlayers instanceof Error) {
    return
  }
  topPlayerVisits.push(...allPlayers.slice(0, 10))
})

TM.addListener('Controller.PlayerJoin', (info) => {
  const topIndex = topPlayerVisits.findIndex(a => a.login === info.login)
  if (topIndex === -1 && info.visits > topPlayerVisits[topPlayerVisits.length - 1].visits) {
    topPlayerVisits.splice(topPlayerVisits.findIndex(a => a.visits < info.visits), 0, { login: info.login, visits: info.visits })
    topPlayerVisits.length = 10
    for (const e of updateListeners) {
      e()
    }
  } else if (topIndex !== -1) {
    const newIndex = topPlayerVisits.findIndex(a => a.visits < info.visits)
    if (newIndex < topIndex) {
      const entry = topPlayerVisits.splice(topIndex, 1)
      topPlayerVisits.splice(newIndex, 0, entry[0])
    } else {
      topPlayerVisits[topIndex].visits++
    }
    for (const e of updateListeners) {
      e()
    }
  }
})

export const TopPlayerVisits = {

  get list() {
    return [...topPlayerVisits]
  },

  onUpdate(callback: () => void) {
    updateListeners.push(callback)
  },

}