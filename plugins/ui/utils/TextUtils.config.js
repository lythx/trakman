import { loadConfig } from "../../../src/ConfigLoader.js"
const defaultConfig = {
  format: '$s',
  textScale: 0.7,
  padding: 0.2,
  yOffset: -0.1
}

export default await loadConfig(defaultConfig, import.meta.url)
