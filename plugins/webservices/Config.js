import { loadConfig } from "../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: true,
  // whether a different service should be used for fetching player data
  // in our case we only really have unitedladder
  altService: true,
  // base api url for the said service
  altServiceURL: 'https://api.ul.unitedascenders.xyz',
  cacheSize: 30
}

export default await loadConfig(defaultConfig, import.meta.url)
