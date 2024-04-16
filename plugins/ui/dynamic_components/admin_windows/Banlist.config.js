import ids from '../../config/ComponentIds.js'
import icons from '../../config/Icons.js'

export default {
  privilege: tm.config.controller.privileges.ban,
  title: " Banned Players ",
  icon: icons.banlist,
  iconWidth: 2,
  iconHeight: 2,
  unbanIcon: icons.unban,
  unbanIconHover: icons.unbanHover,
  entries: 15,
  defaultNickname: 'N/A',
  columnProportions: [
    0.6,
    2,
    2,
    1,
    2.6,
    2,
    1.1
  ],
  navbar: [
    { name: 'Playerlist', actionId: ids.playerList, privilege: Math.min(...Object.values(tm.config.controller.privileges)) },
    { name: 'Blacklist', actionId: ids.blacklist, privilege: tm.config.controller.privileges.blacklist },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.controller.privileges.mute },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.controller.privileges.addGuest },
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  command: {
    aliases: ['banl', 'banlist'],
    help: `Display the banned players list.`,
    privilege: tm.config.controller.privileges.ban // literally useless
  }
}