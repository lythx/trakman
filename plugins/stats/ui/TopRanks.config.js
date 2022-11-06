import { icons, componentIds as ids } from '../../ui/UI.js'

export default {
  title: "Top Ranks",
  icon: icons.chartLocal,
  gridColumns: [0.8, 4, 3, 3, 0.8, 4, 3, 3],
  headers: ['Lp.', 'Nickname', 'Login', 'Average Rank', 'Lp.', 'Nickname', 'Login', 'Average Rank'],
  entries: 30, // Has to be even number
  precision: 4,
  navbar: [
    { name: "Top Donations", actionId: ids.topDonations },
    { name: "Top Playtimes", actionId: ids.topPlaytimes },
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
  selfColour: tm.utils.palette.green
}