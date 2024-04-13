import ids from '../../config/ComponentIds.js'
import icons from '../../config/Icons.js'

export default {
  privilege: tm.config.controller.privileges.blacklist,
  title: " Blacklisted Players ",
  icon: icons.blacklist,
  iconWidth: 2,
  iconHeight: 2,
  unblacklistIcon: icons.unblacklist,
  unblacklistIconHover: icons.unblacklistHover,
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
    { name: 'Banlist', actionId: ids.banlist, privilege: tm.config.controller.privileges.ban },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.controller.privileges.mute },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.controller.privileges.addGuest },
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  command: {
    aliases: ['blackl', 'blacklist'],
    help: `Display the blacklisted players list.`,
    privilege: tm.config.controller.privileges.blacklist // literally useless
  }
}