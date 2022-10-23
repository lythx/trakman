import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 14.5,
  width: cfg.width,
  posX:  cfg.rightPosition - (cfg.marginBig + cfg.width),
  posY: cfg.topBorder,
  side: true,
  title: "Best Finishes",
  icon: icons.bestFinishes,
  margin: cfg.margin,
  background: cfg.background,
  entries: 6,
  columnProportions: [
    1,
    2.8,
    4
  ],
  selfColour: `${tm.utils.palette.green}F`,
  newestColour: `${tm.utils.palette.yellow}F`,
  textScale: 0.87,
  textPadding: 0.2,
}
