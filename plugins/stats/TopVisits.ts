import { trakman as TM } from "../../src/Trakman.js";

const topPlayerVisits: { login: string, visits: number }[] = []
const updateListeners: (() => void)[] = []

const initialize = async () => {
  const allPlayers: any[] | Error = await TM.db.query(`SELECT login, visits FROM players
  ORDER BY visits DESC,
  last_online DESC
  LIMIT 10`)
  if (allPlayers instanceof Error) {
    return
  }
  topPlayerVisits.push(...allPlayers.slice(0, 10))
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

TM.addListener('Controller.PlayerJoin', (info): void => {
  const topIndex: number = topPlayerVisits.findIndex(a => a.login === info.login)
  if (topIndex === -1 && info.visits > topPlayerVisits[topPlayerVisits.length - 1].visits) {
    topPlayerVisits.splice(topPlayerVisits.findIndex(a => a.visits < info.visits), 0, { login: info.login, visits: info.visits })
    topPlayerVisits.length = 10
    for (const e of updateListeners) {
      e()
    }
  } else if (topIndex !== -1) {
    const newIndex: number = topPlayerVisits.findIndex(a => a.visits < info.visits)
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