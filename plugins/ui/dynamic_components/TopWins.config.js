import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: "Top Wins",
  icon: icons.cash,
  gridColumns: [0.8, 4, 3, 3, 0.8, 4, 3, 3],
  headers: ['Lp.', 'Nickname', 'Login', 'Wins', 'Lp.', 'Nickname', 'Login', 'Wins'],
  entries: 30, // Has to be even number
  navbar: [
    { name: "Top Donations", actionId: ids.topDonations },
    { name: "Top Playtimes", actionId: ids.topPlaytimes },
    { name: "Top Ranks", actionId: ids.topRanks },
    { name: "Top Records", actionId: ids.topRecords },
    { name: "Top Sums", actionId: ids.topSums },
    { name: "Top Visits", actionId: ids.topVisits },
    { name: "Top Votes", actionId: ids.topVotes }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  selfColour: "0F0"
}