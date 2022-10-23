import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  posX:  cfg.rightPosition - (cfg.marginBig + cfg.width) * 2,
  posY: cfg.topBorder,
  side: true,
  title: "Top Donators",
  icon: icons.cash,
  margin: cfg.margin,
  background: cfg.background,
  entries: 5,
  columnProportions: [
    1,
    1.9,
    5.1
  ]
}
