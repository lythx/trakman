import { trakman as tm } from '../src/Trakman.js'

interface DonationInfo {
  readonly login: string
  readonly nickname: string
  sum: number,
  readonly history: {
    readonly date: Date,
    readonly amount: number
  }[]
}

const listeners: ((info: DonationInfo & { readonly amount: number }) => void)[] = []
let onlineDonators: DonationInfo[] = []
await tm.db.query(`CREATE TABLE IF NOT EXISTS donations(
  player_id INT4 NOT NULL,
  amount INT4 NOT NULL,
  date TIMESTAMP NOT NULL,
  PRIMARY KEY(player_id, date)
);`)

tm.addListener("Controller.Ready", async () => {
  onlineDonators = await getFromDB(tm.players.list.map(a => a.login))
})

tm.addListener("Controller.PlayerJoin", async (info) => {
  const res = await getFromDB(info.login)
  if (res !== undefined) { onlineDonators.push(res) }
})

tm.addListener('Controller.PlayerLeave', (info) => {
  onlineDonators = onlineDonators.filter(a => a.login !== info.login)
})

async function getFromDB(login: string): Promise<DonationInfo | undefined>
async function getFromDB(logins: string[]): Promise<DonationInfo[]>
async function getFromDB(logins: string | string[]): Promise<DonationInfo | undefined | DonationInfo[]> {
  if (typeof logins === 'string') {
    const id = await tm.getPlayerDBId(logins)
    if (id === undefined) { return }
    const res = await tm.db.query(`SELECT nickname, date, amount FROM donations
    JOIN players ON players.id=donations.player_id
    WHERE player_id=$1
    ORDER BY date ASC`, id)
    if (res instanceof Error) {
      tm.log.error(`Failed to get donation info for player ${logins}`, res.message, res.stack)
      return
    }
    if (res[0] === undefined) { return undefined }
    return {
      login: logins, nickname: res[0].nickname,
      sum: res.reduce((acc, cur) => acc += cur.amount, 0),
      history: res.map(a => ({ amount: a.amount, date: a.date }))
    }
  }
  const ids = await tm.getPlayerDBId(logins)
  if (ids.length === 0) { return [] }
  const res = await tm.db.query(`SELECT login, nickname, date, amount FROM donations
  JOIN players ON players.id=donations.player_id
  WHERE ${logins.map((a, i) => `player_id=$${i + 1} OR `).join('').slice(0, -3)}
  ORDER BY date ASC`, ...ids.map(a => a.id))
  if (res instanceof Error) {
    tm.log.error(`Failed to get donation info for players ${logins.join(',')}`, res.message, res.stack)
    return []
  }
  const ret: DonationInfo[] = []
  for (const login of logins) {
    const arr = res.filter(a => a.login === login)
    if (arr.length === 0) { continue }
    ret.push({
      login, nickname: arr[0]?.nickname,
      sum: arr.reduce((acc, cur) => acc += cur.amount, 0),
      history: arr.map(a => ({ amount: a.amount, date: a.date }))
    })
  }
  return ret
}

const addToDB = async (login: string, amount: number, date: Date): Promise<void> => {
  const id: number | undefined = await tm.getPlayerDBId(login)
  if (id === undefined) {
    tm.log.error(`Failed to save donation from player ${login} (amount ${amount})`, 'Failed to fetch player DB ID')
    return
  }
  await tm.db.query('INSERT INTO donations(player_id, amount, date) VALUES($1, $2, $3)', id, amount, date)
}

const donate = async (payerLogin: string, payerNickname: string, amount: number): Promise<boolean | Error> => {
  const status: boolean | Error = await tm.utils.sendCoppers(payerLogin, amount, 'Donation')
  const date: Date = new Date()
  if (status instanceof Error) {
    tm.log.error(`Failed to receive ${amount} coppers donation from player ${payerLogin}`, status.message)
    tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to process payment.`, payerLogin)
    return status
  } else if (status === true) {
    void addToDB(payerLogin, amount, date)
    tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(payerNickname)}${tm.utils.palette.donation} `
      + `donated ${tm.utils.palette.highlight}${amount}C${tm.utils.palette.donation} to the server.`)
    const info = onlineDonators.find(a => a.login === payerLogin)
    if (info === undefined) { return true }
    info.history.push({ amount, date })
    info.sum += amount
    for (const e of listeners) {
      e({ ...info, amount })
    }
    return true
  }
  return false
}

export const donations = {

  donate,

  fetch: getFromDB,

  get(login: string) {
    return onlineDonators.find(a => a.login === login)
  },

  onDonation(callback: (info: DonationInfo & { readonly amount: number }) => void) {
    listeners.push(callback)
  },

  /**
   * @returns Donators who are currently online
   */
  get list() {
    return [...onlineDonators]
  }

}