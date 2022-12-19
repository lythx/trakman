const p = tm.utils.palette

export default {
  enabled: false,
  betTimeSeconds: 30, // TODO
  messages: {
    noBets: `${p.server}No bets have been placed. Try again next round.`,
    timeRunOut: `${p.server}Time to accept the bet has run out.`,
    noWinner: `${p.server}No player has won the bet. Bet amounts have been returned.`,
    win: `${p.admin}#{name} ${p.server}Has won ${p.admin}#{prize} ${p.server}coppers.`,
    start: `${p.server}#{name} ${p.server}Has started a bet with ${p.admin}#{prize} ${p.server}coppers.`,
    begin: 'betting has doing the begun',
    accept: `${p.admin}#{name} ${p.server}has accepted the bet.`
  },
  copperReturnMessage: 'maybe finish next time if you plan on betting??',
  winMessage: 'GG FOR BET',
  betStartPromptMessage: 'GG',
  betAcceptPropmtMessage: `GG`,
}