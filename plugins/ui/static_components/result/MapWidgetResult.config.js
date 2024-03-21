import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  // Here height is 5 headers with margin
  height: 11.4,
  margin: cfg.margin,
  width: cfg.width,
  title: "Next",
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
    awards: {
      normal: icons.trophy,
      nadeo: icons.trophyNadeo,
      classic: icons.trophyClassic
    },
    tmxWr: icons.bestClock,
    authorScore: icons.clockAuthor,
    goldScore: icons.clockAuthor
  },
  textScale: 1,
  noDateText: "N/A",
  noAwardsText: "N/A",
  noWrText: "-:--.--",
  titles: {
    lastTrack: "Last Map",
    currTrack: "Ongoing",
    nextTrack: "Next Map"
  }
}