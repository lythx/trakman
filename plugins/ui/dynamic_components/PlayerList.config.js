import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'
import { trakman as tm, palette as p} from '../../../src/Trakman.js'

export default {
  title: " Players ",
  privilege: Math.min(...Object.values(tm.config.privileges)),
  icon: icons.playerList,
  ban: "X",
  mute: "mute",
  addGuest: "addGuest",
  removeGuest: "removeGuest",
  entries: 15,
  columnProportions: [
    3,
    3,
    3,
    2,
    2,
    2,
    2,
    2,
    2
  ],
  navbar: [
    { name: 'Banlist', actionId: ids.banlist, privilege: tm.config.privileges.ban },
    { name: 'Blacklist', actionId: ids.blacklist, privilege: tm.config.privileges.blacklist },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.privileges.mute },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.privileges.addGuest }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}
