import { TRAKMAN as TM } from "../src/Trakman.js";

const topPlayerRanks: { login: string, nickname: string, average: number }[] = []
const updateListeners: (() => void)[] = []

const initialize = async () => {
  const res: any[] | Error = await TM.db.query(`SELECT login, nickname, average FROM players
  JOIN player_ids ON player_ids.id=players.id
  ORDER BY average ASC`)
  if (res instanceof Error) {
    return
  }
  topPlayerRanks.push(...res)
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
})

export const TopPlayerRanks = {

  get list() {
    return [...topPlayerRanks]
  },

  onUpdate(callback: () => void) {
    updateListeners.push(callback)
  },

}