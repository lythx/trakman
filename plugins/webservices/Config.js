import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: true,
  cacheSize: 30
}

export default await loadConfig(defaultConfig, import.meta.url)
