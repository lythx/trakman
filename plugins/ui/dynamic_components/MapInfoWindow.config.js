import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  icon: icons.ongoingMap,
  title: 'Map Info',
  navbar: [
    { name: 'Map List', actionId: ids.mapList }
    // TODO add detailed map info here too
  ],
  itemsPerPage: 3,
  queueCount: 4,
  historyCount: 4,
  nameYOffset: -0.2 ,
  localsCount: 5,
  defaultText: '--',
  defaultTime: '-:--.--',
  titles: {
    previous: 'Previous',
    current: 'Ongoing',
    next: 'Next'
  },
  noScreenshot: icons.placeholder,
  notLoaded: `Press DEL if the image\n      doesn't appear`,
  notLoadedTextscale: 0.5,
  margin: 0.15,
  gridRows: [1.2, 6.7, 1.2, 1.2, 4.5, 4.5],
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
  iconBackground: "222C",
  contentBackground: "777C",
  gridBackground: '444A',
  info: {
    background: "FFFA",
    columnsProportions: [1.3, 1.3, 1, 1],
    rows: 4,
    iconWidth: 2,
    textscale: 0.6
  },
  authorTimeWidth: 8,
  iconWidth: 2,
  textscale: 0.67,
  screenshotWidth: 15,
  tmxRecordCount: 3,
  tmxColumns: [0.7, 2, 3, 3, 0.7],
  recordTextScale: 0.6
}