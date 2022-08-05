import { TRAKMAN as TM } from '../src/Trakman.js'

await TM.queryDB(`CREATE TABLE IF NOT EXISTS donations(
  player_id INT4 GENERATED ALWAYS AS IDENTITY,
  amount INT4 NOT NULL,
  date TIMESTAMP NOT NULL
  PRIMARY KEY(player_id, date)
);`)

const updateListeners: (() => void)[] = []
const topDonators: { login: string, nickname: string, amount: number }[] = []
// const onlineDonators: { login: string, amount: number }[] = []

const initialize = async () => {
  const res: any[] | Error = await TM.queryDB(`SELECT SUM(amount) AS amount, login, nickname FROM donations
  JOIN players ON players.id=donations.player_id
  JOIN player_ids ON player_ids.id=donations.player_id
  GROUP BY (login, nickname)
  ORDER BY amount DESC
  LIMIT 10`)
  if (res instanceof Error) {
    TM.error(res)
    return
  }
  topDonators.push(...res)
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  void initialize()
}, true)

const addToDB = async (login: string, amount: number): Promise<void> => {
  const date: number = Date.now()
  const id: number | undefined = await TM.getPlayerDBId(login)
  if (id === undefined) {
    TM.error(`Failed to save donation from player ${login} (amount ${amount})`, 'Failed to fetch player DB ID')
    return
  }
  await TM.queryDB('INSERT INTO donations(player_id, amount, date) VALUES($1, $2, $3)', id, amount, date)
}

const donate = async (payerLogin: string, payerNickname: string, amount: number): Promise<void> => {
  const status: boolean | Error = await TM.sendCoppers(payerLogin, amount, 'Donation')
  if (status instanceof Error) {
    TM.error(`Failed to receive ${amount} coppers donation from player ${payerLogin}`, status.message)
    TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to process payment.`, payerLogin)
  } else if (status === true) {
    void addToDB(payerLogin, amount)
    TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(payerNickname)}${TM.palette.donation} `
      + `donated ${TM.palette.highlight}${amount}C${TM.palette.donation} to the server.`)
  }
}

export const Donations = {

  donate,

  onUpdate(callback: () => void) {
    updateListeners.push(callback)
  },

  get topDonators() {
    return [...topDonators]
  }

}