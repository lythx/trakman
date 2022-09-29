
import { donations } from '../donations/Donations.js'
import config from './Config.js'

const listeners: ((updatedLogin: string, list: { login: string, nickname: string, amount: number }[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []
let topList: { login: string, nickname: string, amount: number }[] = []

const initialize = async () => {
  const res: any[] | Error = await tm.db.query(`SELECT SUM(amount) AS amount, login, nickname FROM donations
  JOIN players ON players.id=donations.player_id
  GROUP BY (login, nickname)
  ORDER BY amount DESC
  LIMIT ${config.donationsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal(res)
    return
  }
  topList.push(...res)
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
}, true)

tm.addListener('PlayerInfoUpdated', (info) => {
  const changedObjects: { login: string, nickname: string }[] = []
  for (const e of topList) {
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

donations.onDonation((info) => {
  const login = info.login
  const amount = info.sum
  if (amount <= topList[topList.length - 1].amount) { return }
  const entry = topList.find(a => a.login === login)
  if (entry !== undefined) {
    entry.amount = amount
    topList.sort((a, b) => b.amount - a.amount)
  } else {
    topList.splice(topList.findIndex(a => a.amount < amount), 0, { login, nickname: info.nickname, amount })
    topList.length = Math.min(config.donationsCount, topList.length)
  }
  for (const e of listeners) {
    e(login, [...topList])
  }
})

export const topDonations = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogin: string, list: { login: string, nickname: string, amount: number }[]) => void) {
    listeners.push(callback)
  },

  /**
   * Add a callback function to execute on donator nickname change
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onNicknameChange(callback: (changes: { login: string, nickname: string }[]) => void) {
    nicknameChangeListeners.push(callback)
  }

}