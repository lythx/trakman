import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

let entries = 7

export default {
  entryHeight: 2.16,
  entries,
  width: cfg.width,
  horizontalModeWidth: cfg.rightPosition - cfg.leftPosition - cfg.width * 2 - cfg.margin * 3,
  posX: cfg.rightPosition - (cfg.marginBig + cfg.width),
  horizontalModePosX: cfg.leftPosition + cfg.width * 2 + cfg.margin * 2,
  posY: cfg.topBorder,
  side: true,
  title: "Best Finishes",
  icon: icons.bestFinishes,
  margin: cfg.margin,
  background: cfg.background,
  columnProportions: [
    1,
    2.8,
    4
  ],
  selfColour: `${tm.utils.palette.green}F`,
  newestColour: `${tm.utils.palette.yellow}F`,
  textScale: 0.87,
  textPadding: 0.2,
  horizontal: false,
  hidePanel: true,
}
