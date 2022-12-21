const p = tm.utils.palette

export default {
  enabled: false,
  betTimeSeconds: 30, // TODO
  messages: {
    noPlayers: `${p.donation}Bet cancelled due to lack of players. Coppers will be returned.`,
    noWinner: `${p.donation}No player has won the bet. Bet coppers will be returned.`,
    win: `${p.highlight}#{name} ${p.donation}has won ${p.highlight}#{prize} ${p.donation}coppers from the bet.`,
    start: `${p.highlight}#{name} ${p.donation}has started a bet with ${p.highlight}#{prize} ${p.donation}coppers.`,
    begin: `${p.donation}Bets are open.`,
    accept: `${p.highlight}#{name} ${p.donation}has accepted the bet.`
  },
  copperReturnMessage: 'maybe finish next time if you plan on betting??',
  winMessage: 'GG FOR BET',
  betStartPromptMessage: 'GG',
  betAcceptPropmtMessage: `GG`,
}