import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 3,
  entryHeight: 2.15,
  width: cfg.width,
  margin: cfg.margin,
  title: "TMX Records",
  icon: icons.maniaExchange,
  columnProportions: [
    1,
    1,
    2.8,
    4
  ],
  topCount: 3,
  displayNoRecordEntry: false,
  hidePanel: true
}