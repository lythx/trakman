import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  posX: cfg.rightPosition - (cfg.marginBig + cfg.width),
  posY: cfg.topBorder,
  side: true,
  title: "Top Hours Played",
  icon: icons.placeholder,
  margin: cfg.margin,
  background: cfg.background,
  entries: 5,
  columnProportions: [
    1,
    1.9,
    5.1
  ]
}