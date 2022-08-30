import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: " Guests ",
  icon: icons.guestlistList,
  entries: 15,
  columnProportions: [
    2,
    2,
    3,
    2,
    1
  ],
  navbar: [
    { name: 'Playerlist', actionId: ids.playerList },
    { name: 'Banlist', actionId: ids.banList },
    { name: 'Blacklist', actionId: ids.blacklistList },
    // TODO add mutelist
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  padding: 0.2
}