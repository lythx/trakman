// import './BettingWindow.component.js'

// const p = tm.utils.palette
// let iftimehasrunout = true
// const betters: string[] = []
// let prize: number | undefined

// tm.addListener('BeginMap', () => {

// })

// tm.commands.add({
//   aliases: ['bet', 'gamble'],
//   help: 'Lose your money quickly.',
//   params: [{ name: 'amount', type: 'int' }],
//   callback: async (info: tm.MessageInfo, amount: number): Promise<void> => {
//     if (prize !== undefined) {
//       tm.sendMessage(`${p.server}d`, info.login)
//       return
//     }
//     let check = await tm.utils.sendCoppers(info.login, amount, 'GG')
//     if (check === true) {
//       betters.push(info.login)
//       prize = amount
//       tm.sendMessage(`${p.server}${info.nickname}Has started a bet with ${p.admin}${prize} ${p.server}coppers.`)
//     }
//   },
//   privilege: 0

// },
//   {
//     aliases: ['accept', 'acceptbet'],
//     help: 'Accept the loss of your money quickly.',
//     callback: async (info: tm.MessageInfo): Promise<void> => {
//       if (prize === undefined) {
//         tm.sendMessage('sorry the betting c', info.login)
//         return
//       }
//       let check = await tm.utils.sendCoppers(info.login, prize, 'GG')
//       if (check === true) {
//         betters.push(info.login)
//         tm.sendMessage(`${p.admin}${info.nickname} ${p.server}has accepted the bet.`)
//       }

//     },
//     privilege: 0
//   })

// tm.addListener('EndMap', () => {
//   let check2 = tm.records.live.find(a => betters.includes(a.login))
//   if (prize === undefined) {
//     return
//   }
//   if (check2 === undefined) {
//     for (const i of betters) {
//       tm.utils.payCoppers(i, prize * 0.75, 'maybe finish next time if you plan on betting??')
//       tm.sendMessage(`${p.server}No player has won the bet. Bet amounts have been returned.`)
//     }
//   }
//   if (check2 !== undefined) {
//     tm.utils.payCoppers(check2.login, prize * betters.length * 0.75, 'GG FOR BET')
//     tm.sendMessage(`${p.admin}${check2.nickname} ${p.server}Has won ${p.admin}${prize * betters.length} ${p.server}coppers.`)
//   }
// })