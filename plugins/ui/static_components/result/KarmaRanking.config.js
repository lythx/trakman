import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  entries: 5,
  entryHeight: 2.15,
  width: cfg.width,
  title: 'Best Maps',
  defaultText: '-',
  icon: icons.karmaStats,
  margin: cfg.margin,
  background: cfg.background,
  minimumVotes: 5,
  columnProportions: [1, 1.9, 5.1]
}

export default await loadConfig(defaultConfig, import.meta.url)
