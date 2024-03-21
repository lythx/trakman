import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  // Here height is 4 headers with margin
  height: 9.13,
  margin: cfg.margin,
  width: cfg.width,
  title: "Ongoing",
  background: cfg.background,
  mapPadding: 0.3,
  customTags: [
    /* Custom tags allow you to display special tag icon for certain authors or maps
     If tmx name or login matches one of the authors or
     map name matches one of the names regexes special tag will be displayed
     map name is tested both stripped and unstripped from special characters
     Tags are read from top to bottom
     */
    { authors: ['Fwo Niro'], icon: icons.tagRed }, 
    { authors: ['tony89300'], icon: icons.tagPinkCyan },
    { names: [/{Kackiest Kacky}*/], icon: icons.tagKacky },
    { names: [/\$w\$i\$f70ARC_*/], icon: icons.tagArcade }
  ],
  icons: {
    header: icons.ongoingMap,
    tags: {
      normal: icons.tag,
      nadeo: icons.tagGreen,
      classic: icons.tagYellow
    },
    author: icons.personBuilder,
    authorTime: icons.clockAuthor,
    buildDate: icons.tools,
    goldScore: icons.clockAuthor,
    authorScore: icons.clockAuthor
  },
  textScale: 1,
  noDateText: "N/A",
  titles: {
    lastTrack: "Last Map",
    currTrack: "Ongoing",
    nextTrack: "Next Map"
  }
}