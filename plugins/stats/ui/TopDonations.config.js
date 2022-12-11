import { icons, componentIds as ids } from '../../ui/UI.js'

export default {
  title: "Top Donations",
  icon: icons.cash,
  gridColumns: [0.8, 4, 3, 3, 0.8, 4, 3, 3],
  headers: ['Lp.', 'Nickname', 'Login', 'Donations', 'Lp.', 'Nickname', 'Login', 'Donations'],
  entries: 30, // Has to be even number
  navbar: [
    { name: "Top Playtimes", actionId: ids.topPlaytimes },
    { name: "Top Ranks", actionId: ids.topRanks },
    { name: "Top Records", actionId: ids.topRecords },
    { name: "Top Sums", actionId: ids.topSums },
    { name: "Top Visits", actionId: ids.topVisits },
    { name: "Top Votes", actionId: ids.topVotes },
    { name: "Top Wins", actionId: ids.topWins }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  selfColour: tm.utils.palette.green,
  command: {
    aliases: ['dons', 'topdons', 'donations'],
    help: `Display top donations.`,
    privilege: 0
  }
}