import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'
const p = tm.utils.palette

export default {
  privilege: tm.config.privileges.blacklist,
  title: " Blacklisted Players ",
  icon: icons.blacklist,
  iconWidth: 2,
  iconHeight: 2,
  unblacklistIcon: icons.unblacklist,
  unblacklistIconHover: icons.unblacklistHover,
  entries: 15,
  selfColour: `${p.green}0`,
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
    { name: 'Playerlist', actionId: ids.playerList, privilege: Math.min(...Object.values(tm.config.privileges)) },
    { name: 'Banlist', actionId: ids.banlist, privilege: tm.config.privileges.ban },
    { name: 'Mutelist', actionId: ids.mutelist, privilege: tm.config.privileges.mute },
    { name: 'Guestlist', actionId: ids.guestlist, privilege: tm.config.privileges.addGuest },
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  messages: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name}${p.admin} from the blacklist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login}${p.error} from the blacklist.`,
    public: true
  }
}