import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 34.12,
  width: cfg.width,
  title: "Local Records",
  icon: icons.chartLocal,
  margin: cfg.margin,
  entries: 15,
  topCount: 5,
  displayNoRecordEntry: true
}