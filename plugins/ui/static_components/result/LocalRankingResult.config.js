import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  title: "Local Records",
  icon: icons.chartLocal,
  margin: cfg.margin,
  entries: 5,
  topCount: 5,
  displayNoRecordEntry: true
}