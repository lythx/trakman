import cfg from '../../../config/RaceUi.js'
import icons from '../../../config/Icons.js'

export default {
  height: 14.5,
  width: cfg.width,
  margin: cfg.margin,
  rows: 3,
  columns: 4,
  order: [
    'VisitCounter',
    'PlayerCounter',
    'VersionButton',
    'TimeButton',
    'MapsButton',
    'StatsButton',
    'SectorsButton',
    'CommandListButton',
    'VoteSkip',
    'VoteReplay',
    'PaySkip',
    'PayReplay'
  ],
  visitCounter: {
    texts: { 0: "#{count}", 1: "$AF4VISITOR#{plural}", equal: false },
    icon: icons.people,
    width: 2,
    height: 2,
    padding: 0.3
  },
  playerCounter: {
    texts: { 0: "#{count} $AF4SPEC#{plural}", 1: "#{count} $AF4PLAYER#{plural}", equal: true },
    icon: icons.peopleGaming,
    width: 2,
    height: 2,
    padding: 0.3
  },
  versionButton: {
    texts: { 0: "#{version}", 1: "$AF4VERSION", equal: false },
    icon: icons.codeBranch,
    width: 1.8,
    height: 1.8,
    padding: 0.3
  },
  timeButton: {
    texts: { 0: "#{time}", 1: "$AF4TIME", equal: false },
    icon: icons.clock,
    width: 1.8,
    height: 1.8,
    padding: 0.2
  },
  mapsButton: {
    texts: { 0: "#{count}", 1: "$AF4MAPS", equal: false },
    icon: icons.numberedList,
    width: 1.8,
    height: 1.8,
    padding: 0.2
  },
  statsButton: {
    texts: { 0: "PLAYER", 1: "$AF4STATS", equal: true },
    icon: icons.stats,
    width: 1.9,
    height: 1.9,
    padding: 0.2
  },
  sectorsButton: {
    texts: { 0: "SECTOR", 1: "$AF4RECORDS", equal: true },
    icon: icons.clockList,
    width: 1.8,
    height: 1.8,
    padding: 0.2
  },
  commandListButton: {
    texts: { 0: "COMMAND", 1: "$AF4LIST", equal: true },
    icon: icons.infoCircle,
    width: 1.8,
    height: 1.8,
    padding: 0.2
  },
  voteSkip: {
    texts: [
      { 0: " VOTE ", 1: "TO $E22SKIP", equal: false },
      { 0: "SKIP IN", 1: "$E22#{seconds} $FFFSECS", equal: true },
      { 0: "$E22DISABLED", 1: "DUE TO RES", equal: true },
      { 0: "MAP IS", 1: "$E22SKIPPED", equal: true },
    ],
    header: `${tm.utils.palette.highlight}Vote to $${tm.utils.palette.red}SKIP${tm.utils.palette.highlight} the ongoing map`,
    icon: icons.voteSkip,
    voteIcon: icons.voteSkip,
    triesLimit: 3,
    timeout: 30,
    time: 30,
    minimumRemainingTime: 30000, // msec
    goal: 0.5,
    width: 1.8,
    height: 1.8,
    padding: 0.2,
    countdown: 5,
    actionId: 1,
    command: {
      aliases: ['s', 'skip'],
      help: `Start a vote to skip the ongoing map.`,
      privilege: 0
    }
  },
  voteReplay: {
    texts: [
      { 0: " VOTE ", 1: "TO $AF4RES", equal: false },
      { 0: "$AF4RES$z$s LIMIT", 1: "REACHED", equal: true },
      { 0: "MAP IS", 1: "$AF4REPLAYED", equal: true },
      { 0: "$E22DISABLED", 1: "DUE TO SKIP", equal: true },
      { 0: "VOTE TO", 1: "$AF4EXTEND", equal: true }
    ],
    timeExtension: 1000 * 60 * 5, // 5 minutes
    resHeader: `${tm.utils.palette.highlight}Vote to $${tm.utils.palette.green}REPLAY${tm.utils.palette.highlight} the ongoing map`,
    extendHeader: `${tm.utils.palette.highlight}Vote to $${tm.utils.palette.green}EXTEND${tm.utils.palette.highlight} the time on the ongoing map`,
    icon: icons.voteReplay,
    voteIcon: icons.voteReplay,
    replayLimit: 5,
    triesLimit: 3,
    timeout: 30,
    time: 30,
    minimumRemainingTime: 30000, //msec
    goal: 0.5,
    width: 1.8,
    height: 1.8,
    padding: 0.2,
    actionId: 2,
    command: {
      aliases: ['r', 'res', 'replay'],
      help: `Start a vote to replay the ongoing map.`,
      privilege: 0
    }
  },
  paySkip: {
    texts: [
      { 0: "PAY $E22#{cost}", 1: "TO $E22SKIP", equal: false },
      { 0: "SKIP IN", 1: "$E22#{seconds} $FFFSECS", equal: true },
      { 0: "$E22DISABLED", 1: "DUE TO RES", equal: true },
      { 0: "MAP IS", 1: "$E22SKIPPED", equal: true },
    ],
    billMessage: 'Pay to skip the ongoing map',
    icon: icons.paySkip,
    width: 1.8,
    height: 1.8,
    padding: 0.2,
    cost: 500,
    countdown: 15,
    actionId: 3
  },
  payReplay: {
    texts: [
      { 0: "PAY $AF4#{cost}", 1: "TO $AF4RES", equal: false },
      { 0: "$AF4RES$z$s LIMIT", 1: "REACHED", equal: true },
      { 0: "MAP IS", 1: "$AF4REPLAYED", equal: true },
      { 0: "$E22DISABLED", 1: "DUE TO SKIP", equal: true }
    ],
    billMessage: 'Pay to restart the ongoing map',
    icon: icons.payReplay,
    width: 1.8,
    height: 1.8,
    padding: 0.2,
    costs: [
      100,
      200,
      300,
      400,
      500
    ],
    actionId: 4
  }
}