import { loadConfig } from "../../../src/ConfigLoader.js"
const defaultConfig = {
  isEnabled: true,
  file: 'test.xml',
  refreshTimeout: 1000,
  commands: {
    displaytest: {
      aliases: ['displaytest'],
      help: `Displays the current test window.`,
      privilege: 3
    },
    hidetest: {
      aliases: ['hidetest'],
      help: `Hides the current test window.`,
      privilege: 3
    }
  }
}

export default await loadConfig(defaultConfig, import.meta.url)
