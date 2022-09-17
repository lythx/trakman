import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: "Players ",
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
    { name: 'Banlist', actionId: ids.banlist },
    { name: 'Blacklist', actionId: ids.blacklist },
    // TODO add mutelist
    { name: 'Guestlist', actionId: ids.guestlist }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}