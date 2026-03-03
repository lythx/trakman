import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/ResultUi.js'

const defaultConfig = {
  height: 6.5,
  width: cfg.width,
  background: cfg.background
}

export default await loadConfig(defaultConfig, import.meta.url)
