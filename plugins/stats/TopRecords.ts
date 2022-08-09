import { trakman as tm } from "../../src/Trakman.js";

let topList: { login: string, nickname: string, amount: number }[] = []
let onlineList: { login: string, nickname: string, amount: number }[] = []
const listeners: (() => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT count(*)::int as amount, nickname, login FROM records
  JOIN players ON players.id=records.player_id
  JOIN maps ON maps.id=records.map_id
  GROUP BY (nickname, login, last_online)
  ORDER BY amount DESC,
  last_online DESC
  LIMIT 10`)
  if (res instanceof Error) {
    await tm.log.fatal('Failed to fetch top records', res.message, res.stack)
    return
  }
  topList = res
}

tm.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

tm.addListener('Controller.PlayerJoin',(info)=> {
  
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

export const topRecords = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: () => void) {
    listeners.push(callback)
  },

}