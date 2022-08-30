import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default
  {
    title: " Banned Players ",
    icon: icons.banList,
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
      { name: 'Blacklist', actionId: ids.blacklistList },
      // TODO add mutelist
      { name: 'Guestlist', actionId: ids.guestlistList }
    ],
    grid: {
      background: "9996",
      margin: 0.15,
      headerBackground: "333C"
    },
    padding: 0.2
  }