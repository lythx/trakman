import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  entries: 5,
  entryHeight: 2.15,
  width: cfg.width,
  title: 'Local Records',
  icon: icons.chartLocal,
  margin: cfg.margin,
  topCount: 5,
  displayNoRecordEntry: true
}

export default await loadConfig(defaultConfig, import.meta.url)
