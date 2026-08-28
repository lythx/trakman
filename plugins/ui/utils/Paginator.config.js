import { loadConfig } from "../../../src/ConfigLoader.js"
import icons from '../config/Icons.js'

const defaultConfig = {
  buttonWidth: 3,
  buttonHeight: 3,
  margin: 0.4,
  padding: 0.2,
  background: '000D',
  icons: [icons.pageFirst, icons.pageDoubleLeft, icons.pageLeft, icons.pageRight, icons.pageDoubleRight,
    icons.pageLast],
  iconsHover: [icons.pageFirstHover, icons.pageDoubleLeftHover, icons.pageLeftHover, icons.pageRightHover,
    icons.pageDoubleRightHover, icons.pageLastHover]
}

export default await loadConfig(defaultConfig, import.meta.url)
