import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 7,
  entryHeight: 2.15,
  width: cfg.width,
  title: "Lap Records",
  icon: icons.chartLocal,
  margin: cfg.margin,
  topCount: 3,
  displayNoRecordEntry: true,
  hidePanel: true
}