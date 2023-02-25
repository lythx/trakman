import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 17.22,
  width: cfg.width,
  cupHeight: 17.22,
  title: "Rounds Points",
  icon: icons.chartLocal,
  margin: cfg.margin,
  entries: 7,
  cupEntries: 7,
  topCount: 5,
  columnProportions: [1, 2, 5],
  displayNoRecordEntry: true,
  cupPositionImages: [icons.trophyClassic, icons.trophy, icons.trophyNadeo],
  otherCupPositionsImage: icons.placeholder
}