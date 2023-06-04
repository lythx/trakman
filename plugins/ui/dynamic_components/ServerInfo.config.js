import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: `Server Overview`,
  icon: icons.trakman,
  navbar: [
    { name: `Changelog`, actionId: ids.changelog }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  nameColumnBackground: '5559',
  columnProportions: [
    2,
    2,
    2,
    2
  ],
  serverCellHeader: ` Server Information `,
  serverCells: [
    ` Dedicated Server Uptime `,
    ` Dedicated Server Version `,
    ` Dedicated Server Build `,
    ` Server Name `,
    ` Server Login `,
    ` Server Zone `,
    ` Server Rights `,
    ` Server Max Players `,
    ` Server Max Spectators `,
    ` Server Max Records `,
    ` Server Map Count `,
    ` Server Visitor Count`,
  ],
  hostCellHeader: ` Host Information `,
  hostCells: [
    ` System Uptime `,
    ` System Architecture `,
    ` System CPU `,
    ` System CPU Load `,
    ` System Free RAM `,
    ` System Kernel `,
    ` Trakman Version `,
    ` Trakman Uptime `,
    ` NodeJS Version `,
    ` NodeJS RAM Usage `,
    ` PostgreSQL Version `,
    ` PostgreSQL DB Size `
  ],
  command: {
    aliases: ['server', 'serverinfo', 'sinfo', 'si'],
    help: `Display the detailed server information.`,
    privilege: 0
  }
}