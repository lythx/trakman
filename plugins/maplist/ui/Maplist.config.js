import { icons, componentIds as ids } from '../../ui/UI.js'
const p = tm.utils.palette

export default {
  title: "Map List",
  icon: icons.mapList,
  textScale: 1,
  padding: 0.1,
  removePrivilege: tm.config.controller.privileges.removeMap,
  overlayBackground: '7777',
  defaultText: '-',
  colour: p.green,
  optionTitles: {
    jukebox: 'Jukebox'
  },
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
  ],
  icons: [
    icons.ongoingMap, // Map header icon
    icons.tag, // Map name icon
    icons.personBuilder, // Author name icon
    icons.clockAuthor, // Author time icon
    icons.chartLocal, // PB position icon
    icons.karmaPulse, // Local karma icon
    icons.trashcanDelete, // Remove map icon
    icons.trashcanDeleteHover, // Remove map icon
    icons.carExplode // Environment
  ],
  displayEnvironment: undefined, // Display environment instead of karma
  iconWidth: 2,
  queueWidth: 5.2,
  queueNumberWidth: 2.9,
  timeWidth: 5,
  positionWidth: 3.1,
  iconBackground: "222C",
  contentBackground: "555C",
  plusImage: icons.addMap,
  minusImage: icons.removeMap,
  blankImage: icons.blank,
  public: true,
  authorSearchSeparator: '$a',
  pageSearchSeparator: '$p',
  messages: {
    error: `${p.error}Error while adding the map to queue.`,
    noPermission: `${p.error}You can't add more than one map to the queue.`,
    remove: `${p.highlight}#{player} ${p.vote}removed ${p.highlight}#{map}${p.vote} from the queue.`,
    add: `${p.highlight}#{player} ${p.vote}added ${p.highlight}#{map}${p.vote} to the queue.`
  },
  commands: {
    list: {
      aliases: ['l', 'ml', 'list'],
      help: `Display list of maps. Options: $$a[author], $$p[page], jb, name, karma, short, long, best, worst.`,
      privilege: 0
    },
    best: {
      aliases: ['best'],
      help: `Display list of maps sorted by rank ascending.`,
      privilege: 0
    },
    worst: {
      aliases: ['worst'],
      help: `Display list of maps sorted by rank descending.`,
      privilege: 0
    },
    jukebox: {
      aliases: ['jb', 'jukebox'],
      help: `Display jukebox.`,
      privilege: 0
    }
  }
}