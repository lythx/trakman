import { loadConfig } from "../../../../src/ConfigLoader.js"
import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

const defaultConfig = {
  title: 'Donations',
  height: 4.49,
  width: cfg.width,
  icon: icons.cash,
  margin: cfg.margin,
  background: cfg.background,
  hidePanel: true,
  amounts: [50, 100, 200, 500, 1000, 5000]
}

export default await loadConfig(defaultConfig, import.meta.url)
