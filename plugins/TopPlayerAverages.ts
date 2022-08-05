import { TRAKMAN as TM } from "../src/Trakman.js";

const topPlayerRanks: { login: string, nickname: string, average: number }[] = []
const updateListeners: (() => void)[] = []

TM.addListener('Controller.Ready', async (): Promise<void> => {
  const res: any[] | Error = await TM.queryDB(`SELECT login, nickname, average FROM players
  JOIN player_ids ON player_ids.id=players.id
  ORDER BY average ASC`)
  if (res instanceof Error) {
    return
  }
  topPlayerRanks.push(...res)
})

export const TopPlayerRanks = {

  get list() {
    return [...topPlayerRanks]
  },

  onUpdate(callback: () => void) {
    updateListeners.push(callback)
  },

}