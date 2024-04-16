import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

const p = tm.utils.palette

export default {
  width: 60,
  title: `Personal Stats`,
  icon: icons.person,
  navbar: [
    { name: `All Stats`, actionId: ids.topRanks }
  ],
  grid: {
    background: '9996',
    margin: 0.15,
    headerBackground: '333C'
  },
  sumsColours: ['FD0','CCC', 'C73', 'FFF'],
  nameColumnBackground: '5559',
  columnProportions: [
    2,
    2,
  ],
  cellHeader: ` Player Info `,
  cells: [
    ` Player Login `,
    ` Player Nickname `,
    ` Player Nation `,
    ` Player Privilege `,
    ` Server Rank `,
    ` Server Average `,
    ` Total Playtime `,
    ` Total Records `,
    ` Total Map Votes `,
    ` Top Sums `,
    ` Visits Amount `,
    ` Donations Amount `,
    ` Wins Amount `,
    ` Account Type `,
    ` Last Seen `
  ],
  command: {
    aliases: ['ps', 'stats', 'playerstats', 'pls'],
    help: `Display the detailed stats page for a player.`,
    privilege: 0,
    error: `${p.error}There's no information about this player in the database.`
  }
}