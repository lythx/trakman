import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 17.22,
  width: cfg.width,
  title: "Lap Records",
  // TODO ICON
  icon: icons.chartLocal,
  margin: cfg.margin,
  entries: 7,
  topCount: 5,
  displayNoRecordEntry: true
}