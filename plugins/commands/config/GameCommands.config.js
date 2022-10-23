const p = tm.utils.palette

export default {
  setgamemode: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the gamemode to ${p.highlight}#{mode}${p.admin}.`,
    public: true,
    privilege: 2
  },
  setwarmup: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{state} ${p.admin}warmup mode.`,
    error: `${p.error}Server is not in rounds/teams/laps/cup mode.`,
    public: true,
    privilege: 2
  },
  setlapsamount: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the laps amount to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in laps mode.`,
    insufficientLaps: `${p.error}Laps amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setroundslapsamount: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the laps amount to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in rounds mode.`,
    insufficientLaps: `${p.error}Laps amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setroundspointlimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the points limit to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in rounds mode.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setteamspointlimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the points limit to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in teams mode.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setteamsmaxpoints: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max points per team to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in teams mode.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setcuppointlimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the points limit to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in cup mode.`,
    insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setcuproundspermap: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of rounds per map to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in cup mode.`,
    insufficientRounds: `${p.error}Rounds amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setcupwarmuptime: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of rounds in warm-up to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in cup mode.`,
    insufficientRounds: `${p.error}Rounds amount cannot be less than zero`,
    public: true,
    privilege: 2
  },
  setcupwinnersamount: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of cup winners to ${p.highlight}#{amount}${p.admin}.`,
    error: `${p.error}Server is not in cup mode.`,
    insufficientWinners: `${p.error}Winners amount cannot be less or equal to zero`,
    public: true,
    privilege: 2
  },
  setchattime: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the podium time to ${p.highlight}#{value} ${p.admin}seconds.`,
    public: true,
    privilege: 3
  },
  disablerespawn: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the checkpoint respawning.`,
    public: true,
    privilege: 3
  },
  forceshowopp: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the forced opponent display.`,
    public: true,
    privilege: 3
  },
}