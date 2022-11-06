import icons from '../config/Icons.js'
const p = tm.utils.palette

export default {
  title: "TMX Search Result",
  addPrivilege: 1,
  icon: icons.mapList,
  textScale: 1,
  padding: 0.1,
  overlayBackground: '7777',
  defaultText: '-',
  colour: p.green,
  texts: {
    map: 'Map #'
  },
  rows: 5,
  columns: 5,
  grid: {
    background: 'FFFA',
    margin: 0.15
  },
  navbar: [
  ],
  icons: [
    icons.ongoingMap,
    icons.maniaExchange,
    icons.tag,
    icons.personBuilder,
    icons.clockAuthor,
    icons.trophy,
    icons.calendarPlus
  ],
  iconWidth: 2,
  timeWidth: 4.5,
  awardsWidth: 2,
  iconBackground: "222C",
  contentBackground: "555C",
  plusImage: icons.addMap,
  blankImage: icons.blank,
  public: true,
  messages: {
    searchError: `${p.error}Failed to search for the maps.`,
    fetchError: `${p.error}Failed to fetch the map from TMX.`,
    error: `${p.error}Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by #{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.admin}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from TMX.`
  }
}