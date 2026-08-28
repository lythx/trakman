import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  entries: 5,
  entryHeight: 2.15,
  width: cfg.width,
  title: 'Most Visits',
  icon: icons.person,
  margin: cfg.margin,
  background: cfg.background,
  columnProportions: [1, 1.9, 5.1]
}

export default await loadConfig(defaultConfig, import.meta.url)
