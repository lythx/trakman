import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  entries: 3, // when changing this value, change topCount as well. // TODO: RecordList->getDisplayedRecords()
  entryHeight: 2.15,
  width: cfg.width,
  margin: cfg.margin,
  title: 'TMX Records',
  icon: icons.maniaExchange,
  columnProportions: [1, 1, 2.8, 4],
  topCount: 3,
  displayNoRecordEntry: false,
  hidePanel: true
}

export default await loadConfig(defaultConfig, import.meta.url)
