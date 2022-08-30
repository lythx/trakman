import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  posX: cfg.leftPosition + (cfg.width + cfg.margin) * 2 + cfg.margin,
  posY: cfg.topBorder,
  side: false,
  title: "Most Records",
  icon: icons.personBetter,
  margin: cfg.margin,
  background: cfg.background,
  entries: 5,
  columnProportions: [
    1,
    1.9,
    5.1
  ]
}
