import { loadConfig } from "../../../src/ConfigLoader.js"
const defaultConfig = {
  textScale: 0.85,
  margin: 0.15
}

export default await loadConfig(defaultConfig, import.meta.url)
