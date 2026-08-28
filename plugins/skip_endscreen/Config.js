import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: false, // For how long to wait before forcing everybody into specmode (in seconds)
  waitTime: 5
}

export default await loadConfig(defaultConfig, import.meta.url)
