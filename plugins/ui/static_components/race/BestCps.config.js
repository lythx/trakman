import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 14.5,
  width: cfg.width,
  posX:  cfg.leftPosition + cfg.marginBig + cfg.width,
  posY: cfg.topBorder,
  side: false,
  title: "Best Cps",
  icon: icons.bestClock,
  margin: cfg.margin,
  background: cfg.background,
  entries: 6,
  columnProportions: [
    1,
    2.8,
    4
  ],
  selfColour: "0F0F",
  newestColour: "FF0F",
  textScale: 0.87,
  textPadding: 0.2,
  upIcon: icons.pageLeft,
  downIcon: icons.pageRight
}
