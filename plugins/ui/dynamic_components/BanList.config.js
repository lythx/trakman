import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'
import { palette as p } from '../../../src/Trakman.js'

export default {
  privilege: 2,
  title: " Banned Players ",
  icon: icons.banlist,
  iconWidth: 2,
  iconHeight: 2,
  unbanIcon: icons.unban,
  unbanIconHover: icons.unbanHover,
  entries: 15,
  selfColour: "0F0",
  defaultNickname: 'N/A',
  columnProportions: [
    0.8,
    2,
    2,
    2,
    2,
    2,
    1
  ],
  navbar: [
    { name: 'Playerlist', actionId: ids.playerList },
    { name: 'Blacklist', actionId: ids.blacklist },
    { name: 'Guestlist', actionId: ids.guestlist }

    // TODO add mutelist
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  messages: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unbanned ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unban ${p.highlight}#{login}${p.error}.`,
    notBanned: `${p.highlight}#{login}${p.error} is not banned.`,
    public: true
  }
}