import { trakman as TM } from "../src/Trakman.js";

const topPlayerWins: { login: string, nickname: string, wins: number }[] = []
const updateListeners: (() => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await TM.db.query(`SELECT login, nickname, wins FROM players
  JOIN players ON players.id=players.id
  ORDER BY wins DESC,
  last_online DESC
  LIMIT 10`)
  if (res instanceof Error) {
    return
  }
  topPlayerWins.push(...res.slice(0, 10))
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

// TM.addListener('Controller.PlayerJoin', (info): void => {
//   const topIndex: number = topPlayerWins.findIndex(a => a.login === info.login)
//   if (topIndex === -1 && info.visits > topPlayerWins[topPlayerWins.length - 1].visits) {
//     topPlayerWins.splice(topPlayerWins.findIndex(a => a.visits < info.visits), 0, { login: info.login, visits: info.visits })
//     topPlayerWins.length = 10
//     for (const e of updateListeners) {
//       e()
//     }
//   } else if (topIndex !== -1) {
//     const newIndex: number = topPlayerWins.findIndex(a => a.visits < info.visits)
//     if (newIndex < topIndex) {
//       const entry = topPlayerWins.splice(topIndex, 1)
//       topPlayerWins.splice(newIndex, 0, entry[0])
//     } else {
//       topPlayerWins[topIndex].visits++
//     }
//     for (const e of updateListeners) {
//       e()
//     }
//   }
// })

export const TopPlayerWins = {

  get list() {
    return [...topPlayerWins]
  },

  onUpdate(callback: () => void) {
    updateListeners.push(callback)
  },

}