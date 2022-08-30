import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 34.12,
  width: cfg.width,
  title: "Dedi Records",
  icon: icons.chartDedi,
  margin: cfg.margin,
  entries: 15,
  columnProportions: [
    1,
    2.8,
    4,
    1
  ],
  topCount: 5,
  displayNoRecordEntry: true
}
