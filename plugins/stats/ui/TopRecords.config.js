import { icons, componentIds as ids } from '../../ui/UI.js'
export default {
  title: "Top Records",
  icon: icons.stats,
  gridColumns: [0.8, 4, 3, 3, 0.8, 4, 3, 3],
  headers: ['Lp.', 'Nickname', 'Login', 'Records', 'Lp.', 'Nickname', 'Login', 'Records'],
  entries: 30, // Has to be even number
  navbar: [
    { name: "Top Donations", actionId: ids.topDonations },
    { name: "Top Playtimes", actionId: ids.topPlaytimes },
    { name: "Top Ranks", actionId: ids.topRanks },
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
    aliases: ['toprecs', 'toprecords'],
    help: `Display top record amounts.`,
    privilege: 0
  }
}