import { icons, componentIds as ids } from '../../ui/UI.js'

export default {
  title: "Top Playtimes",
  icon: icons.cash,
  gridColumns: [0.8, 4, 3, 3, 0.8, 4, 3, 3],
  headers: ['Lp.', 'Nickname', 'Login', 'Hours Played', 'Lp.', 'Nickname', 'Login', 'Hours Played'],
  entries: 30, // Has to be even number
  navbar: [
    { name: "Top Donations", actionId: ids.topDonations },
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
    aliases: ['toppt', 'playtimes', 'active'], // it's /active in YOU KNOW WHERE dunno why
    help: `Display top playtimes.`,
    privilege: 0
  }
}