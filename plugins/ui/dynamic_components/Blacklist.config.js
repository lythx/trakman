import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'
import { palette as p } from '../../../src/Trakman.js'

export default {
  privilege: 2,
  title: " Blacklisted Players ",
  icon: icons.blacklist,
  iconWidth: 2,
  iconHeight: 2,
  unblacklistIcon: icons.unblacklistHover, // todo
  unblacklistIconHover: icons.unblacklistHover,
  entries: 15,
  selfColour: "0F0",
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
    { name: 'Playerlist', actionId: ids.playerList },
    { name: 'Banlist', actionId: ids.banlist },
    { name: 'Mutelist', actionId: ids.mutelist },
    { name: 'Guestlist', actionId: ids.guestlist }
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