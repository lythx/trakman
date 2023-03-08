import icons from '../../config/Icons.js'
import ids from '../../config/ComponentIds.js'
const p = tm.utils.palette
const priv = tm.admin.privileges

export default {
  title: " Players ",
  kickPrivilege: priv.kick,
  forceSpecPrivilege: priv.forceSpectator,
  privilege: 1, // Privilege required to open the window
  icon: icons.playerList,
  iconWidth: 2,
  iconHeight: 2,
  public: true,
  disabledColour: '333C',
  privilegeColours: {
    0: 'FFF',
    1: tm.utils.palette.green,
    2: tm.utils.palette.purple,
    3: tm.utils.palette.red,
    4: tm.utils.palette.yellow
  },
  icons: {
    kick: icons.kick,
    ban: icons.ban,
    blacklist: icons.addToBlacklist,
    mute: icons.mute,
    unmute: icons.unmute,
    addGuest: icons.addGuest,
    removeGuest: icons.removeGuest,
    forceSpec: icons.forceSpectator,
    forcePlay: icons.forceGaming
  },
  hoverIcons: {
    kick: icons.kickHover,
    ban: icons.banHover,
    blacklist: icons.addToBlacklistHover,
    mute: icons.muteHover,
    unmute: icons.unmuteHover,
    addGuest: icons.addGuestHover,
    removeGuest: icons.removeGuestHover,
    forceSpec: icons.forceSpectatorHover,
    forcePlay: icons.forceGamingHover
  },
  entries: 15,
  columnProportions: [
    1.5,
    3,
    3,
    2,
    2,
    2,
    2,
    2,
    2,
    2
  ],
  navbar: [
    { name: 'Banlist', actionId: ids.banlist, privilege: tm.config.controller.privileges.ban },
    { name: 'Blacklist', actionId: ids.blacklist, privilege: tm.config.controller.privileges.blacklist },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.controller.privileges.mute },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.controller.privileges.addGuest }
  ],
  selfColour: `${p.green}`,
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  command: {
    aliases: ['players', 'playerl', 'playerlist'],
    help: `Display the players list.`,
    privilege: 1
  }
}
