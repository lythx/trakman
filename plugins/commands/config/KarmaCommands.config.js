import { loadConfig } from "../../../src/ConfigLoader.js"
const defaultConfig = {
  aliases: ['+++', '++', '+', '-', '--', '---'], // DONT TOUCH THIS OR YOU DIE
  help: `Vote for a map.`
}

export default await loadConfig(defaultConfig, import.meta.url)
