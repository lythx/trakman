import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 5,
  entryHeight: 2.15,
  width: cfg.width,
  title: "Next Map Records",
  icon: icons.chartLive,
  margin: cfg.margin,
  columnProportions: [
    1,
    2.9,
    4.1
  ],
  topCount: 5,
  displayNoRecordEntry: true
}
