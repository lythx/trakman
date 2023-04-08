import ids from '../../config/ComponentIds.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  privilege: tm.config.controller.privileges.mute,
  title: " Muted Players ",
  icon: icons.mutelist,
  iconWidth: 2,
  iconHeight: 2,
  unmuteIcon: icons.unmute,
  unmuteIconHover: icons.unmuteHover,
  entries: 15,
  selfColour: `${p.green}`,
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
    { name: 'Blacklist', actionId: ids.blacklist, privilege: tm.config.controller.privileges.blacklist },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.controller.privileges.addGuest }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  command: {
    aliases: ['mutel', 'mutelist'],
    help: `Display the muted players list.`,
    privilege: tm.config.controller.privileges.mute
  }
}