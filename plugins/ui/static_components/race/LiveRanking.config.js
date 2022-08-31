import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 15.07,
  width: cfg.width,
  title: "Live Records",
  icon: icons.chartLive,
  margin: cfg.margin,
  entries: 6,
  topCount: 5,
  displayNoRecordEntry: true,
  maxRecordsAmount: 3000 // If more records than this get driven in one round the click listener will break
}