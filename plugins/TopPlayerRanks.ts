import { TRAKMAN as TM } from "../src/Trakman.js";

const topPlayerRanks: { login: string, nickname: string, rank: number }[] = []
const updateListeners: (() => void)[] = []

TM.addListener('Controller.Ready', async (): Promise<void> => {
  const res: any[] | Error = await TM.queryDB(`SELECT login, nickname FROM players
  JOIN player_ids ON player_ids.id=players.id
  ORDER BY average ASC`)
  if (res instanceof Error) {
    return
  }
  for (let i = 0; i < res.length; i++) {
    topPlayerRanks.push({ ...res[i], rank: i + 1 })
  }

})

export const TopPlayerRanks = {

  get list() {
    return [...topPlayerRanks]
  },

  onUpdate(callback: () => void) {
    updateListeners.push(callback)
  },

}