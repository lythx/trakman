import { loadConfig } from "../../../src/ConfigLoader.js"
import icons from '../config/Icons.js'

const defaultConfig = {
  height: 3.5,
  textScale: 0.75,
  margin: 0.15,
  padding: 1,
  background: '000C',
  hoverImage: icons.bgGreyOpaque50
}

export default await loadConfig(defaultConfig, import.meta.url)
