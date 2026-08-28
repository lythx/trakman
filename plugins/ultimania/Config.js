import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: false,
  syncName: true, // If true, sets player nicknames in the database to those fetched from Ultimania
  host: `http://ultimania5.askuri.de/api/v5`
}

export default await loadConfig(defaultConfig, import.meta.url)
