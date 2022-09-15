import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'
import { palette as p } from '../../../src/Trakman.js'

export default {
  privilege: 1,
  title: " Guests ",
  icon: icons.guestlistList,
  iconWidth: 2,
  iconHeight: 2,
  unGuestListIcon: '', // TODO
  entries: 15,
  selfColour: "0F0",
  defaultNickname: 'N/A',
  columnProportions: [
    0.8,
    2,
    2,
    2,
    2,
    1
  ],
  navbar: [
    { name: 'Playerlist', actionId: ids.playerList },
    { name: 'Banlist', actionId: ids.banList },
    { name: 'Blacklist', actionId: ids.blacklistList },
    // TODO add mutelist
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  padding: 0.2,
  messages: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has added ${p.highlight}#{name} ${p.admin}to the guestlist.`,
    error: `${p.error}Could not add #{login} to the guestlist.`,
    alreadyGuest: `${p.error}#{login} is already in the guestlist.`,
    public: true
  }
}