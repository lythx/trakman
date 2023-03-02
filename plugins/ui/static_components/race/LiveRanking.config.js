import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 15.07,
  lapsHeight: 17.22,
  width: cfg.width,
  title: "Live Records",
  lapsTitle: "Live Ranking",
  icon: icons.chartLive,
  margin: cfg.margin,
  entries: 6,
  lapsEntries: 7,
  topCount: 5,
  displayNoRecordEntry: true,
  lapsNoRecordEntry: '--/--',
  cpsCollectedColour: tm.utils.palette.green,
  maxRecordsAmount: 3000 // If more records than this get driven in one round the click listener will break
}