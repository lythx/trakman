import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: true,
  queueCount: 4,
  historyCount: 4
}

export default await loadConfig(defaultConfig, import.meta.url)
