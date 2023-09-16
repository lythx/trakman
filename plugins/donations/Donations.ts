import config from './Config.js'

interface DonationInfo {
  readonly login: string
  nickname: string
  sum: number,
  readonly history: {
    readonly date: Date,
    readonly amount: number
  }[]
}

const listeners: ((info: DonationInfo & { readonly amount: number }) => void)[] = []
const nicknameChangeListeners: ((info: DonationInfo[]) => void)[] = []
let onlineDonators: DonationInfo[] = []
await tm.db.query(`CREATE TABLE IF NOT EXISTS donations(
  player_id INT4 NOT NULL,
  amount INT4 NOT NULL,
  date TIMESTAMP NOT NULL,
  PRIMARY KEY(player_id, date)
);`)

tm.addListener("Startup", async (): Promise<void> => {
  onlineDonators = await getFromDB(tm.players.list.map(a => a.login))
})

tm.addListener("PlayerJoin", async (info): Promise<void> => {
  const res: DonationInfo | undefined = await getFromDB(info.login)
  if (res !== undefined) { onlineDonators.push(res) }
})

tm.addListener('PlayerLeave', (info): void => {
  onlineDonators = onlineDonators.filter(a => a.login !== info.login)
})

tm.addListener('PlayerDataUpdated', (info): void => {
  const changedObjects: DonationInfo[] = []
  for (const e of onlineDonators) {
    const newNickname: string | undefined = info.find(a => a.login === e.login)?.nickname
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

/**
 * Fetches donation info for the player
 * @param login Player login
 * @returns Donation object if successfull, undefined if player is not in the donators database
 */
async function getFromDB(login: string): Promise<DonationInfo | undefined>
/**
 * Fetches donation info for multiple players
 * @param logins Array of player logins
 * @returns Array of donation objects
 */
async function getFromDB(logins: string[]): Promise<DonationInfo[]>
async function getFromDB(logins: string | string[]): Promise<DonationInfo | undefined | DonationInfo[]> {
  if (typeof logins === 'string') {
    const id: number | undefined = await tm.db.getPlayerId(logins)
    if (id === undefined) { return }
    const res: any[] | Error = await tm.db.query(`SELECT nickname, date, amount FROM donations
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
  const ids = await tm.db.getPlayerId(logins)
  if (ids.length === 0) { return [] }
  const res: any[] | Error = await tm.db.query(`SELECT login, nickname, date, amount FROM donations
  JOIN players ON players.id=donations.player_id
  WHERE ${logins.map((a, i): string => `player_id=$${i + 1} OR `).join('').slice(0, -3)}
  ORDER BY date ASC`, ...ids.map(a => a.id))
  if (res instanceof Error) {
    tm.log.error(`Failed to get donation info for players ${logins.join(',')}`, res.message, res.stack)
    return []
  }
  const ret: DonationInfo[] = []
  for (const login of logins) {
    const arr: any[] = res.filter(a => a.login === login)
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
  const id: number | undefined = await tm.db.getPlayerId(login)
  if (id === undefined) {
    tm.log.error(`Failed to save donation from player ${login} (amount ${amount})`, 'Failed to fetch player DB ID')
    return
  }
  await tm.db.query('INSERT INTO donations(player_id, amount, date) VALUES($1, $2, $3)', id, amount, date)
}

tm.commands.add({
  aliases: ['donate'],
  help: 'Donate coppers to the server.',
  params: [{ name: 'amount', type: 'int' }],
  callback(info, amount: number) {
    donate(info.login, info.nickname, amount)
  },
  privilege: 0
})

/**
 * Donate coppers to server
 * @param payerLogin Login of the player 
 * @param payerNickname Nickname of the player
 * @param amount Amount of coppers to donate
 * @returns True if successfull, false if player refuses payment, Error if dedicated server call fails
 */
const donate = async (payerLogin: string, payerNickname: string, amount: number): Promise<boolean | Error> => {
  if (amount < config.minimalAmount) {
    tm.sendMessage(config.amountTooLow, payerLogin)
    return new Error(`Coppers amount too low`)
  }
  const status: boolean | Error = await tm.utils.sendCoppers(payerLogin, amount, 'Donation')
  const date: Date = new Date()
  if (status instanceof Error) {
    tm.log.error(`Failed to receive ${amount} coppers donation from player ${payerLogin}`, status.message)
    tm.sendMessage(config.paymentFail, payerLogin)
    return status
  } else if (status === true) {
    void addToDB(payerLogin, amount, date)
    tm.sendMessage(tm.utils.strVar(config.paymentSuccess, {
      nickname: tm.utils.strip(payerNickname),
      amount
    }))
    let info: DonationInfo | undefined = onlineDonators.find(a => a.login === payerLogin)
    const isOnline = tm.players.get(payerLogin) !== undefined
    if (info === undefined) {
      if (isOnline) {
        info = {
          login: payerLogin, nickname: payerNickname, sum: 0, history: []
        }
        onlineDonators.push(info)
      } else {
        return true
      }
    }
    info.history.push({ amount, date })
    info.sum += amount
    for (const e of listeners) {
      e({ ...info, amount })
    }
    return true
  }
  return false
}

/**
 * Gets donation info for the player
 * @param login Player login
 * @returns Donation object if successfull, undefined if player is not in the donators database or is offline
 */
function getDonation(login: string): DonationInfo | undefined
/**
 * Gets donation info for multiple online players
 * @param logins Array of player logins
 * @returns Array of donation objects
 */
function getDonation(logins: string[]): DonationInfo[]
function getDonation(logins: string | string[]): DonationInfo | DonationInfo[] | undefined {
  if (typeof logins === 'string') {
    return onlineDonators.find(a => a.login === logins)
  }
  return onlineDonators.filter(a => logins.includes(a.login))
}

/**
 * Provides utilities related to server coppers donations.
 * Stores donations history in database.
 * @author lythx
 * @since 0.4
 */
export const donations = {

  donate,

  fetch: getFromDB,

  getOnline: getDonation,

  /**
   * Add a callback function to execute on donation
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onDonation(callback: (info: DonationInfo & { readonly amount: number }) => void) {
    listeners.push(callback)
  },

  /**
   * Add a callback function to execute on donator nickname change
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onNicknameChange(callback: (info: DonationInfo[]) => void) {
    nicknameChangeListeners.push(callback)
  },

  /**
   * Donators who are currently online
   */
  get onlineList(): DonationInfo[] {
    return [...onlineDonators]
  }

}
