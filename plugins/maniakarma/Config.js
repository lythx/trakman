import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: true,
  reconnectTimeout: 300 //seconds
}

export default await loadConfig(defaultConfig, import.meta.url)
