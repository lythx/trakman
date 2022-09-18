import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'
import { palette as p } from '../../../src/Trakman.js'

export default {
  privilege: 2,
  title: " Muted Players ",
  icon: icons.mutelist,
  iconWidth: 2,
  iconHeight: 2,
  unmuteIcon: icons.unmute, 
  unmuteIconHover: icons.unmuteHover,
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
    { name: 'Blacklist', actionId: ids.blacklist },
    { name: 'Guestlist', actionId: ids.guestlist }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  messages: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unmuted ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unmuted ${p.highlight}#{login}${p.error}.`,
    notMuted: `${p.highlight}#{login}${p.error} is not muted.`,
    public: true
  }
}