import { TRAKMAN as TM } from '../src/Trakman.js'

await TM.queryDB(`CREATE TABLE IF NOT EXISTS donations(
  player_id INT4 GENERATED ALWAYS AS IDENTITY,
  amount INT4 NOT NULL,
  date TIMESTAMP NOT NULL
  PRIMARY KEY(player_id, date)
);`)

const topDonators: { login: string, nickname: string, amount: number }[] = []
// const onlineDonators: { login: string, amount: number }[] = []

TM.addListener('Controller.Ready', async (): Promise<void> => {
  const res: any[] | Error = await TM.queryDB(`SELECT amount, login, nickname FROM donations
  JOIN players ON players.id=donations.player_id`)
  if (res instanceof Error) {
    TM.error(res)
    return
  }
  const donations: { login: string, nickname: string, amount: number }[] = []
  while (res.length > 0) {
    const login = res[0].login
    let i: number = 0
    let amount: number = 0
    while (true) {
      if (res[i] === undefined) { break }
      if (res[i].login === login) {
        amount += res[i].amount
        res.splice(i, 1)
        i--
      }
      i++
    }
    donations.push({ ...res[0], amount })
  }
  topDonators.push(...donations.sort((a, b): number => b.amount - a.amount).slice(0, 10))
})

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

export const Donations = { donate }