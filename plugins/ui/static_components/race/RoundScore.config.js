import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  roundsHeight: 17.22,
  teamsHeight: 23.48,
  cupHeight: 17.22,
  width: cfg.width,
  title: "Round Score",
  icon: icons.chartLocal,
  margin: cfg.margin,
  roundsEntries: 7,
  teamsEntries: 10,
  cupEntries: 7,
  topCount: 5,
  cupFinalistIcon: icons.flagFinish,
  cupPositionImages: [icons.trophyClassic, icons.trophySilver, icons.trophyBronze],
  otherCupPositionsImage: icons.flagFinish,
  displayNoRecordEntry: true
}