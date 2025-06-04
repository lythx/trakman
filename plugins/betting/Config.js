const p = tm.utils.palette

export default {
  // If false plugin cant be activated
  isEnabled: false,
  // This can be changed using an ingame command
  isActive: false,
  betTimeSeconds: 30,
  minimumAmount: 50,
  messages: {
    noPlayers: `${p.donation}Bet cancelled due to lack of players. Coppers will be returned.`,
    noWinner: `${p.donation}No player has won the bet. Bet coppers will be returned.`,
    win: `${p.highlight}#{name} ${p.donation}has won ${p.highlight}#{prize} ${p.donation}coppers from the bet.`,
    start: `${p.highlight}#{name} ${p.donation}has started a bet with ${p.highlight}#{prize} ${p.donation}coppers.`,
    begin: `${p.donation}Bets are open. Use ${p.highlight}/bet ${p.donation}to place a bet.`,
    accept: `${p.highlight}#{name} ${p.donation}has accepted the bet.`,
    startupEnabled: `${p.donation}Betting plugin is ${p.highlight}enabled${p.donation}.`
      + ` Use ${p.highlight}//dbet ${p.donation}if you want to disable it.`,
    startupDisabled: `${p.donation}Betting plugin is ${p.highlight}disabled${p.donation}.`
      + ` Use ${p.highlight}//ebet ${p.donation}if you want to enable it.`,
    amountTooLow: `${p.error}Amount of bet coppers too low. Minimum amount is ${p.highlight}#{minimum}${p.error}.`,
    closed: `${p.error}Bets are closed.`
  },
  copperReturnMessage: '$FFFReturned #{amount} coppers for unsuccessfull bet on #{serverName}$FFF server. (Nadeo tax deducted)',
  winMessage: '$FFFYou won #{amount} coppers from bet on #{serverName}$FFF server. GG! (Nadeo tax deducted)',
  betStartPromptMessage: 'Pay to start a bet with #{amount} coppers',
  betAcceptPropmtMessage: `Pay to accept the bet`,
  activatePrivilege: 3,
  bet: {
    aliases: ['bet'],
    help: `Bet your coppers.`,
    public: true,
    privilege: 0,
    prizeNeeded: `${p.error}You need to specify the bet prize.`,
    noPrizeNeeded: `${p.error}Specified bet prize was ignored because somebody ` +
      `else has already placed a bet. Prize is ${p.highlight}#{prize}${p.error}.`,
  },
  activate: {
    aliases: ['ebet', 'enablebets'],
    help: `Enable the betting plugin.`,
    public: true,
    success: `${p.donation}#{title} ${p.highlight}#{name} ${p.donation}has ${p.highlight}enabled ${p.donation}the betting plugin.`,
    alreadyActive: `${p.error}Betting plugin is already enabled.`
  },
  deactivate: {
    aliases: ['dbet', 'disablebets'],
    help: `Disable the betting plugin.`,
    public: true,
    success: `${p.donation}#{title} ${p.highlight}#{name} ${p.donation}has ${p.highlight}disabled ${p.donation}the betting plugin.`,
    alreadyNotActive: `${p.error}Betting plugin is already disabled.`
  }
}