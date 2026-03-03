import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  entries: 7,
  entryHeight: 2.15,
  width: cfg.width,
  title: 'Lap Records',
  icon: icons.chartLocal,
  margin: cfg.margin,
  topCount: 3,
  displayNoRecordEntry: true,
  hidePanel: true
}

export default await loadConfig(defaultConfig, import.meta.url)
