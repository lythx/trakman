import { palette as p } from '../../../src/Trakman.js'

export default {
  skip: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has skipped the ongoing map.`,
    public: true,
    privilege: 1
  },
  res: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has restarted the ongoing map.`,
    public: true,
    privilege: 1
  },
  prev: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`,
    error: `${p.error}Could not queue the previous map since the map history is empty.`,
    public: true,
    privilege: 1
  },
  replay: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the ongoing map.`,
    public: true,
    privilege: 1
  },
  endround: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced the ongoing round to end.`,
    error: `${p.error}Server is not in rounds/teams/laps/cup mode.`,
    public: true,
    privilege: 1
  },
  forceteam: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into the #{team} ${p.admin}team.`,
    error: `${p.error}Invalid team.`,
    notRounds: `${p.error}Server is not in teams mode.`,
    playerOffline: `${p.error}Player is not on the server`,
    public: true,
    privilege: 2
  }
}