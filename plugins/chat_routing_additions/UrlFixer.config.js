import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: true,
  matchRegex: /(http:\/\/|https:\/\/)/gi,
  importance: 1
}

export default await loadConfig(defaultConfig, import.meta.url)
