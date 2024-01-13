import icons from '../config/Icons.js'
const p = tm.utils.palette

export default {
  title: "TMX Search Result",
  addPrivilege: tm.config.controller.privileges.addMap,
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
    icons.ongoingMap, // Map header icon
    icons.maniaExchange, // MX icon
    icons.tag, // Map name icon
    icons.personBuilder, // Author name icon
    icons.clockAuthor, // Author time icon
    icons.trophy, // Map awards icon
    icons.calendarPlus // Map upload date
  ],
  iconWidth: 2,
  timeWidth: 4.5,
  awardsWidth: 2,
  iconBackground: "222C",
  contentBackground: "555C",
  plusImage: icons.addMap,
  blankImage: icons.blank,
  public: true,
  authorSearchSeparator: '$a',
  messages: {
    searchError: `${p.error}Failed to search for the maps.`,
    fetchError: `${p.error}Failed to fetch the map from TMX.`,
    error: `${p.error}Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by #{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.admin}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from TMX.`
  },
  command: {
    aliases: ['xlist', 'searchtmx', 'searchmap'],
    help: `Search for maps matching the specified name on TMX and display them in a window.`,
    privilege: 0
  }
}