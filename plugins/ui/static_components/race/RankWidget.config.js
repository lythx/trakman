import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/RaceUi.js'

const defaultConfig = {
  height: 3.8,
  width: cfg.width,
  background: cfg.background
}

export default await loadConfig(defaultConfig, import.meta.url)
