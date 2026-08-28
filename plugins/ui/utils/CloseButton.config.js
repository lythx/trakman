import { loadConfig } from "../../../src/ConfigLoader.js"
import icons from '../config/Icons.js'

const defaultConfig = {
  buttonWidth: 3,
  buttonHeight: 3,
  icon: icons.close,
  iconHover: icons.closeHover,
  padding: 0.2,
  background: '000D'
}

export default await loadConfig(defaultConfig, import.meta.url)
