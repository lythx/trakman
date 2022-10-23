import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 8.68,
  width: cfg.width,
  margin: cfg.margin,
  title: "TMX Records",
  icon: icons.maniaExchange,
  entries: 3,
  columnProportions: [
    1,
    1,
    2.8,
    4
  ],
  topCount: 3,
  displayNoRecordEntry: false
}