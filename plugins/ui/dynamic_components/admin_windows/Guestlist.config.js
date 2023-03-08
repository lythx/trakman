import ids from '../../config/ComponentIds.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  privilege: tm.config.controller.privileges.addGuest,
  title: " Guests ",
  icon: icons.guestlist,
  iconWidth: 2,
  iconHeight: 2,
  removeGuestIcon: icons.removeGuest,
  removeGuestIconHover: icons.removeGuestHover,
  entries: 15,
  selfColour: p.green,
  defaultNickname: 'N/A',
  columnProportions: [
    0.8,
    2,
    2,
    2,
    2,
    1
  ],
  navbar: [
    { name: 'Playerlist', actionId: ids.playerList, privilege: Math.min(...Object.values(tm.config.controller.privileges)) },
    { name: 'Banlist', actionId: ids.banlist, privilege: tm.config.controller.privileges.ban },
    { name: 'Blacklist', actionId: ids.blacklist, privilege: tm.config.controller.privileges.blacklist },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.controller.privileges.mute }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  command: {
    aliases: ['guestl', 'guestlist'],
    help: `Display the guest players list.`,
    privilege: tm.config.controller.privileges.addGuest
  }
}