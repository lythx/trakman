import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 6,
  lapsEntries: 12,
  entryHeight: 2.15,
  width: cfg.width,
  title: "Live Records",
  lapsTitle: "Live Ranking",
  icon: icons.chartLive,
  margin: cfg.margin,
  topCount: 3,
  lapsTopCount: 5,
  displayNoRecordEntry: true,
  lapsNoRecordEntry: '--/--',
  cpsCollectedColour: tm.utils.palette.green,
  hidePanel: true,
  maxRecordsAmount: 3000 // If more records than this get driven in one round the click listener will break
}