import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/ResultUi.js'

const defaultConfig = {
  height: 6.1,
  width: cfg.width,
  background: cfg.background
}

export default await loadConfig(defaultConfig, import.meta.url)
