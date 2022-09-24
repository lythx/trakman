import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'
import { trakman as tm, palette as p } from '../../../src/Trakman.js'

export default {
  title: " Players ",
  privilege: Math.min(...Object.values(tm.config.privileges)),
  icon: icons.playerList,
  iconWidth: 2,
  iconHeight: 2,
  icons: {
    kick: icons.ban, // todo
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
    kick: icons.ban, // todo
    ban: icons.banHover,
    blacklist: icons.addToBlacklistHover,
    mute: icons.muteHover,
    unmute: icons.unmuteHover,
    addGuest: icons.addGuestHover,
    removeGuest: icons.removeGuestHover,
    forceSpec: icons.forceSpectator, // todo
    forcePlay: icons.forceGaming // todo
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
    { name: 'Banlist', actionId: ids.banlist, privilege: tm.config.privileges.ban },
    { name: 'Blacklist', actionId: ids.blacklist, privilege: tm.config.privileges.blacklist },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.privileges.mute },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.privileges.addGuest }
  ],
  selfColour: "0F0",
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
    blacklist: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has blacklisted ${p.highlight}#{name}${p.admin}#{duration}.`,
    blacklistError: `${p.error}Could not blacklist ${p.highlight}#{login}${p.error}.`,
    ban: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has banned ${p.highlight}#{name}${p.admin}#{duration}.`
  }
}
