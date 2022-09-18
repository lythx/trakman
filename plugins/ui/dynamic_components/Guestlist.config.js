import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'
import { palette as p } from '../../../src/Trakman.js'

export default {
  privilege: 1,
  title: " Guests ",
  icon: icons.guestlist,
  iconWidth: 2,
  iconHeight: 2,
  removeGuestIcon: icons.removeGuest,
  removeGuestIconHover: icons.removeGuestHover,
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
    { name: 'Banlist', actionId: ids.banlist },
    { name: 'Blacklist', actionId: ids.blacklist },
    { name: 'Mutelist', actionId: ids.mutelist }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  messages: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the guestlist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login}${p.error} from the guestlist.`,
    notInGuestlist: `${p.highlight}#{login}${p.error} is not in the guestlist.`,
    public: true
  }
}