import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: "TMX Detailed Info",
  icon: icons.maniaExchange,
  margin: 0.15,
  windowHeight: 40,
  icons: {
    header: icons.ongoingMap,
    name: icons.tag,
    download: icons.download,
    author: icons.person,
    authorTime: icons.clockAuthor,
    addDate: icons.calendarPlus,
    copperPrice: icons.cash,
    environment: icons.carExplode,
    mood: {
      day: icons.moodDay,
      night: icons.moodNight,
      sunrise: icons.moodSunrise,
      sunset: icons.moodSunset
    },
    voteRatio: icons.karmaPulse,
    style: icons.mapStyle,
    difficulty: {
      beginner: icons.difficultyEasy,
      intermediate: icons.difficultyMedium,
      expert: icons.difficultyHard,
      lunatic: icons.difficultyExtreme
    },
    type: icons.puzzle,
    leaderboardRating: {
      normal: icons.leaderboardRating,
      classic: icons.leaderboardRatingClassic,
      nadeo: icons.leaderboardRatingNadeo
    },
    awards: {
      normal: icons.trophy,
      classic: icons.trophyClassic,
      nadeo: icons.trophyNadeo
    },
    routes: icons.mapRoutes,
    buildDate: icons.tools,
    game: icons.trackmania,
    voteCount: icons.peopleKarma,
    maniaExchange: icons.maniaExchange,
    downloadGreen: icons.downloadHover,
    dedimania: icons.chartDedi,
    tmxAuthor: icons.personBuilder,
    checkpointsAmount: icons.clockList
  },
  columnProportions: [
    1,
    1,
    1
  ],
  rowProportions: [
    1,
  ],
  grid: {
    background: '555A',
    margin: 0.15
  },
  navbar: [
    {
      name: "Map Info",
      actionId: ids.TMXWindow,
    },
  ],
  tmxRecordsProportions: [
    0.7,
    2,
    3,
    3,
    0.7
  ],
  tmxRecordsAmount: 10,
  recordTextScale: 0.6,
  iconBackground: "222C",
  contentBackground: "777C",
  gridBackground: '777A',
  defaultTime: `-:-.--`,
  defaultText: `--`,
  noScreenshot: icons.noScreenshot,
  screenshotPadding: 1,
  notLoaded: `Press DEL if the image\n      doesn't appear`,
  notLoadedTextscale: 0.5,
  info: {
    background: "FFFA",
    columnsProportions: [1.3, 1.3, 1, 1],
    rows: 4,
    iconWidth: 2,
    textscale: 0.6
  },
  description: {
    format: '$s',
    padding: 1,
    textSize: 1,
    textLength: 550,
    lineLength: 40,
    textBackground: '666C',
    defaultText: 'The author has not provided a description for this map.'
  },
  command: {
    aliases: ['td', 'tmxdetails'],
    help: `Display TMX detailed information for the ongoing map.`,
    privilege: 0
  }
}