import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  entries: 5,
  entryHeight: 2.15,
  width: cfg.width,
  posX: cfg.rightPosition - (cfg.marginBig + cfg.width) * 2,
  posY: cfg.topBorder,
  side: true,
  title: 'Top Donators',
  icon: icons.cash,
  margin: cfg.margin,
  background: cfg.background,
  columnProportions: [1, 1.9, 5.1]
}

export default await loadConfig(defaultConfig, import.meta.url)
