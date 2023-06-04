import { icons, componentIds as ids } from '../../ui/UI.js'

export default {
  title: "Top Sums",
  icon: icons.stats,
  gridColumns: [0.8, 4, 3, 1, 1, 1, 1.3, 0.8, 4, 3, 1, 1, 1, 1.3],
  headers: ['Lp.', 'Nickname', 'Login', '1st', '2nd', '3rd', 'Other',
    'Lp.', 'Nickname', 'Login', '1st', '2nd', '3rd', 'Other',],
  entries: 30, // Has to be even number
  navbar: [
    { name: "Top Donations", actionId: ids.topDonations },
    { name: "Top Playtimes", actionId: ids.topPlaytimes },
    { name: "Top Ranks", actionId: ids.topRanks },
    { name: "Top Records", actionId: ids.topRecords },
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
  colours: {
    gold: 'FD0',
    silver: 'CCC',
    bronze: 'C73'
  },
  command: {
    aliases: ['sums', 'topsums'],
    help: `Display top record summaries.`,
    privilege: 0
  }
}