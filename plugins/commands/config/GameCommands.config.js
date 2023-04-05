const p = tm.utils.palette

export default {
  setgamemode: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the gamemode to ${p.highlight}#{mode}${p.admin}.`,
    public: true,
    privilege: 2,
    aliases: ['sgm', 'setgamemode'],
    help: `Change the gamemode.`
  },
  settimelimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the time limit to ${p.highlight}#{time}${p.admin}.`,
    public: true,
    privilege: 3,
    aliases: ['stl', 'settimelimit'],
    help: `Set the time you spend gaming.`
  },
  setchattime: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the podium time to ${p.highlight}#{time}${p.admin}.`,
    public: true,
    privilege: 3,
    aliases: ['sct', 'setchattime'],
    help: `Set the time you spend on the podium screen.`
  },
  setwarmup: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{state} ${p.admin}warmup mode.`,
    public: true,
    privilege: 2,
    aliases: ['swu', 'setwarmup'],
    help: `Set whether the server is in warmup mode.`
  },
  setlapsamount: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the laps amount to ${p.highlight}#{amount}${p.admin}.`,
    insufficientLaps: `${p.error}Laps amount cannot be less or equal to zero.`,
    public: true,
    privilege: 2,
    aliases: ['sla', 'setlapsamount'],
    help: `Set the laps amount in laps mode.`
  },
  setroundslapsamount: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the rounds mode laps amount to ${p.highlight}#{amount}${p.admin}.`,
    resetText: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the rounds mode laps amount to default map value.`,
    insufficientLaps: `${p.error}Laps amount cannot be less than zero.`,
    public: true,
    privilege: 2,
    aliases: ['srla', 'setroundslapsamount'],
    help: `Set the laps amount in rounds mode. Set 0 to use default map laps.`
  },
  setroundspointlimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the rounds mode points limit to ${p.highlight}#{amount}${p.admin}.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero.`,
    public: true,
    privilege: 2,
    aliases: ['srpl', 'setroundspointlimit'],
    help: `Set the points limit for rounds mode.`
  },
  setteamspointlimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the teams mode points limit to ${p.highlight}#{amount}${p.admin}.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero.`,
    public: true,
    privilege: 2,
    aliases: ['stpl', 'setteamspointlimit'],
    help: `Set the points limit for teams mode.`
  },
  setteamsmaxpoints: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max points per team to ${p.highlight}#{amount}${p.admin}.`,
    insufficientPoints: `${p.error}Points amount cannot be less than zero.`,
    public: true,
    privilege: 2,
    aliases: ['stmp', 'setteamsmaxpoints'],
    help: `Set the max obtainable points per round for teams mode.`
  },
  setcuppointlimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the cup mode points limit to ${p.highlight}#{amount}${p.admin}.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero.`,
    public: true,
    privilege: 2,
    aliases: ['scpl', 'setcuppointlimit'],
    help: `Set the points limit for cup mode.`
  },
  setcuproundspermap: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of rounds per map to ${p.highlight}#{amount}${p.admin}.`,
    insufficientRounds: `${p.error}Rounds amount cannot be less than zero.`,
    public: true,
    privilege: 2,
    aliases: ['scrpm', 'setcuproundspermap'],
    help: `Set the amount of rounds per map for cup mode.`
  },
  setcupwarmuprounds: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of rounds in warm-up to ${p.highlight}#{amount}${p.admin}.`,
    insufficientRounds: `${p.error}Rounds amount cannot be less than zero.`,
    public: true,
    privilege: 2,
    aliases: ['scwr', 'setcupwarmuprounds'],
    help: `Set the amount of rounds in warmup for cup mode.`
  },
  setcupwinnersamount: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of cup winners to ${p.highlight}#{amount}${p.admin}.`,
    insufficientWinners: `${p.error}Winners amount cannot be less or equal to zero.`,
    public: true,
    privilege: 2,
    aliases: ['scwa', 'setcupwinnersamount'],
    help: `Set the amount of winners for cup mode.`
  },
  forceshowopp: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the forced opponent display.`,
    public: true,
    privilege: 3,
    aliases: ['fso', 'forceshowopp', 'forceshowopponents'],
    help: `Set whether forced opponent display is enabled.`
  },
  disablerespawn: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the checkpoint respawning.`,
    public: true,
    privilege: 3,
    aliases: ['drp', 'disablerespawn'],
    help: `Set whether checkpoint respawning is enabled.`
  },
}