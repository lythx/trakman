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
  columnProportions: [1, 1.5, 5.5],
  displayNoRecordEntry: true,
  noRecordEntryText: '--',
  // TODO actual trophies
  cupPositionImages: [icons.trophyClassic, icons.trophySilver, icons.trophyBronze],
  otherCupPositionsImage: icons.trophy,
  cupFinalistImage: icons.flagFinish,
  cupImageVerticalPadding: 0.1,
  cupImageHorizontalPadding: 0.3
}