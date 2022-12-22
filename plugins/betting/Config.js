const p = tm.utils.palette

export default {
  enabled: false,
  betTimeSeconds: 30,
  messages: {
    noPlayers: `${p.donation}Bet cancelled due to lack of players. Coppers will be returned.`,
    noWinner: `${p.donation}No player has won the bet. Bet coppers will be returned.`,
    win: `${p.highlight}#{name} ${p.donation}has won ${p.highlight}#{prize} ${p.donation}coppers from the bet.`,
    start: `${p.highlight}#{name} ${p.donation}has started a bet with ${p.highlight}#{prize} ${p.donation}coppers.`,
    begin: `${p.donation}Bets are open.`,
    accept: `${p.highlight}#{name} ${p.donation}has accepted the bet.`
  },
  copperReturnMessage: '$FFFReturned #{amount} coppers for unsuccessfull bet on #{serverName}$FFF server.',
  winMessage: '$FFFYou won #{amount} coppers from bet on #{serverName}$FFF server. GG!',
  betStartPromptMessage: 'Pay to start a bet with #{amount} coppers',
  betAcceptPropmtMessage: `Pay to accept the bet`,
}