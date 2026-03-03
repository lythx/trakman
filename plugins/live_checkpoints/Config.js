import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: false
}

export default await loadConfig(defaultConfig, import.meta.url)
