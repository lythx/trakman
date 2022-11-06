import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'
const p = tm.utils.palette

export default {
  title: " Players ",
  kickPrivilege: 1,
  forceSpecPrivilege: 1,
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
  messages: {
    kick: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    forceSpec: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into spectator mode.`,
    forcePlay: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into player mode.`,
    mute: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has muted ${p.highlight}#{name}${p.admin}.`,
    unmute: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unmuted ${p.highlight}#{name}${p.admin}.`,
    unmuteError: `${p.error}Could not unmute ${p.highlight}#{login}${p.error}.`,
    addGuest: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has added ${p.highlight}#{name} ${p.admin}to the guestlist.`,
    addGuestError: `${p.error}Could not add ${p.highlight}#{login}${p.error} to the guestlist.`,
    removeGuest: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the guestlist.`,
    removeGuestError: `${p.error}Could not remove ${p.highlight}#{login}${p.error} from the guestlist.`,
    blacklist: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has blacklisted ${p.highlight}#{name}${p.admin}.`,
    blacklistError: `${p.error}Could not blacklist ${p.highlight}#{login}${p.error}.`,
    ban: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has banned ${p.highlight}#{name}${p.admin}.`
  }
}
