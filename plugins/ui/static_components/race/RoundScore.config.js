import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  roundsEntries: 12,
  teamsEntries: 10,
  cupEntries: 12,
  entryHeight: 2.15,
  width: cfg.width,
  title: "Round Score",
  icon: icons.chartLocal,
  margin: cfg.margin,
  roundsTopCount: 5,
  teamsTopCount: 5,
  cupTopCount: 5,
  cupFinalistIcon: icons.flagFinish,
  cupPositionImages: [icons.trophyClassic, icons.trophySilver, icons.trophyBronze],
  otherCupPositionsImage: icons.flagFinish,
  displayNoRecordEntry: true,
  markerBackgrounds: {
    red: tm.utils.palette.red + '6',
    blue: tm.utils.palette.purple + '6'
  },
  hidePanel: true
}