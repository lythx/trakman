import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  title: "Next Map Records",
  icon: icons.chartLive,
  margin: cfg.margin,
  entries: 5,
  columnProportions: [
    1,
    2.9,
    4.1
  ],
  topCount: 5,
  displayNoRecordEntry: true
}
