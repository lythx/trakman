import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: " Blacklisted Players ",
  icon: icons.blacklistList,
  entries: 15,
  columnProportions: [
    2,
    2,
    2,
    3,
    1
  ],
  navbar: [
    { name: 'Playerlist', actionId: ids.playerList },
    { name: 'Banlist', actionId: ids.banList },
    // TODO add mutelist
    { name: 'Guestlist', actionId: ids.guestList }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  padding: 0.2
}