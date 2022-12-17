import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
    title: `Server Overview`,
    icon: icons.placeholder,
    navbar: [
        { name: `Changelog`, actionId: ids.changelog }
    ],
    grid: {
        background: "9996",
        margin: 0.15,
        headerBackground: "333C"
    },
    columnProportions: [
        3,
        2,
        3,
        2
    ],
    textScale: 1.4,
    tileBackground: "9996",
    marginBig: 1,
    entries: 4,
    headerHeight: 3,
    cells: [
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
        ` System Uptime `,
        ` System Architecture `,
        ` System CPU `,
        ` System CPU Load `,
        ` System RAM `,
        ` System Kernel `,
        ` Trakman Version `,
        ` Trakman Uptime `,
        ` NodeJS Version `,
        ` NodeJS RAM Usage `,
        ` PostgreSQL Version `,
        ` PostgreSQL DB Size `,
    ],
    command: {
        aliases: ['server', 'serverinfo', 'sinfo'],
        help: `Display the detailed server information.`,
        privilege: 0
    }
}