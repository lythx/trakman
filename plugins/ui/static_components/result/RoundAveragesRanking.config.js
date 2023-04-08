import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 5,
  entryHeight: 2.15,
  width: cfg.width,
  posX: cfg.rightPosition - (cfg.marginBig + cfg.width),
  posY: cfg.topBorder,
  side: true,
  title: "Round Averages",
  icon: icons.clockList,
  margin: cfg.margin,
  background: cfg.background,
  columnProportions: [
    1,
    2.9,
    4.1
  ]
}

