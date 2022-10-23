import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  title: "Top Ranks",
  icon: icons.stats,
  background: cfg.background,
  margin: cfg.margin,
  entries: 5,
  columnProportions: [
    1,
    1.9,
    5.1
  ],
  topCount: 5,
  displayNoRecordEntry: true
} 