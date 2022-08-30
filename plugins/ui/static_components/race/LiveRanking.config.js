import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 15.07,
  width: cfg.width,
  title: "Live Records",
  icon: icons.chartLive,
  margin: cfg.margin,
  entries: 6,
  columnProportions: [
    1,
    1,
    2.8,
    4
  ],
  topCount: 5,
  displayNoRecordEntry: true
}