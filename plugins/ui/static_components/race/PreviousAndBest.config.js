import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/RaceUi.js'

const defaultConfig = {
  height: 4.95,
  width: cfg.width,
  margin: cfg.margin,
  background: cfg.background
}

export default await loadConfig(defaultConfig, import.meta.url)
