import { donations } from '../donations/Donations.js'
import config from './Config.js'

let topList: { readonly login: string, nickname: string, amount: number }[] = []
const updateListeners: ((changes: readonly Readonly<{ login: string, nickname: string, amount: number }>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []

const initialize = async () => {
  const res: { amount: number, login: string, nickname: string }[] | Error =
    await tm.db.query(`SELECT SUM(amount) AS amount, login, nickname FROM donations
  JOIN players ON players.id=donations.player_id
  GROUP BY (login, nickname)
  ORDER BY amount DESC
  LIMIT ${config.donationsCount}`)
  if (res instanceof Error) {
    await tm.log.fatal(res)
    return
  }
  topList = res
}

tm.addListener('Startup', (): void => void initialize(), true)

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
  if (topList.length < config.donationsCount && amount <= topList[topList.length - 1].amount) { return }
  const entry = topList.find(a => a.login === login)
  const updated: typeof topList= []
  if (entry !== undefined) {
    entry.amount = amount
    updated.push(entry)
    topList.sort((a, b) => b.amount - a.amount)
  } else {
    const obj = { login, nickname: info.nickname, amount }
    updated.push(obj)
    topList.push(obj)
    topList.sort((a, b) => b.amount - a.amount)
    topList.length = Math.min(config.donationsCount, topList.length)
  }
  for (const e of updateListeners) { e(updated) }
})

export const topDonations = {

  /**
   * List of players sorted by the amount of coppers donated to the server
   */
  get list(): readonly Readonly<{ login: string, nickname: string, amount: number }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top donations list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{ login: string, nickname: string, amount: number }>[]) => void): void {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on donator nickname change
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onNicknameChange(callback: (changes: readonly Readonly<{ login: string, nickname: string }>[]) => void): void {
    nicknameChangeListeners.push(callback)
  }

}