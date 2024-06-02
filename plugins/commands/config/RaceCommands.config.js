const p = tm.utils.palette

export default {
  skip: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has skipped the ongoing map.`,
    public: true,
    privilege: 1,
    aliases: ['s', 'skip'],
    help: `Skip to the next map.`
  },
  res: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has restarted the ongoing map.`,
    public: true,
    privilege: 1,
    aliases: ['r', 'res', 'restart'],
    help: `Restart the current map.`
  },
  prev: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`,
    error: `${p.error}Could not queue the previous map since the map history is empty.`,
    public: true,
    privilege: 1,
    aliases: ['pt', 'prev', 'previous'],
    help: `Requeue the previously played map.`
  },
  replay: {
    privilege: 1,
    aliases: ['rq', 'requeue', 'replay'],
    help: `Requeue the ongoing map.`
  },
  endround: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced the ongoing round to end.`,
    error: `${p.error}Server is not in rounds/teams/laps/cup mode.`,
    public: true,
    privilege: 1,
    aliases: ['er', 'endround'],
    help: `End the ongoing round in rounds-based gamemodes.`
  },
  forceteam: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into the #{team} ${p.admin}team.`,
    notRounds: `${p.error}Server is not in teams mode.`,
    playerOffline: `${p.error}Player is not on the server`,
    public: true,
    privilege: 2,
    aliases: ['fpt', 'forceteam', 'forceplayerteam'],
    help: `Force a player into the specified team.`
  }
}