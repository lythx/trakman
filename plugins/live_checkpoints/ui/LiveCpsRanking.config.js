import { loadConfig } from "../../../src/ConfigLoader.js"
import cfg from '../../ui/config/RaceUi.js'
import icons from '../../ui/config/Icons.js'

const defaultConfig = {
  entries: 6,
  entryHeight: 2.15,
  width: cfg.width,
  title: 'Live Checkpoints',
  icon: icons.bestClock,
  margin: cfg.margin,
  topCount: 1,
  displayNoRecordEntry: false,
  cpsCollectedColour: tm.utils.palette.green,
  hidePanel: true,
  maxRecordsAmount: 3000 // If more records than this get driven in one round the click listener will break
}

export default await loadConfig(defaultConfig, import.meta.url)
