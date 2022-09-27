import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: "Map List",
  icon: icons.mapList,
  textScale: 1,
  padding: 0.1,
  overlayBackground: '7777',
  defaultText: '-',
  colour: '$0F0',
  texts: {
    map: 'Map #',
    queued: 'Queued',
    noRank: "--."
  },
  rows: 5,
  columns: 5,
  grid: {
    background: 'FFFA',
    margin: 0.15
  },
  navbar: [
    { name: 'Map Info', actionId: ids.TMXWindow }
    // TODO add detailed map info here too
  ],
  icons: [
    icons.ongoingMap,
    icons.tag,
    icons.personBuilder,
    icons.clockAuthor,
    icons.chartLocal,
    icons.karmaPulse
  ],
  iconWidth: 2,
  queueWidth: 5.2,
  queueNumberWidth: 2.9,
  timeWidth: 5,
  positionWidth: 3.1,
  iconBackground: "222C",
  contentBackground: "555C",
  plusImage: icons.addMap,
  minusImage: icons.removeMap,
  blankImage: icons.blank
}