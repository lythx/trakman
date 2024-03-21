import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 8,
  cupEntries: 8,
  entryHeight: 2.15,
  width: cfg.width,
  title: "Rounds Points",
  icon: icons.chartLocal,
  margin: cfg.margin,
  topCount: 5,
  cupTopCount: 5,
  columnProportions: [1, 1.5, 5.5],
  displayNoRecordEntry: true,
  noRecordEntryText: '--',
  cupPositionImages: [icons.trophyClassic, icons.trophySilver, icons.trophyBronze],
  otherCupPositionsImage: icons.trophy,
  cupFinalistImage: icons.flagFinish,
  cupImageVerticalPadding: 0.1,
  cupImageHorizontalPadding: 0.3,
  hidePanel: true
}