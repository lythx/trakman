import icons from '../config/Icons.js'
import cfg from '../config/RaceUi.js'
import header from './StaticHeaderRace.config.js'

export default {
  title: " Vote ",
  width: 25,
  height: 10,
  margin: cfg.margin,
  background: cfg.background,
  posX: cfg.leftPosition + cfg.marginBig + cfg.width,
  posY: cfg.topBorder - (14.5 + cfg.marginBig), // add buttons widget height
  headerHeight: header.height,
  buttonHeight: 2.5,
  buttonWidth: 2.5,
  headerTextXOffset: 0.2 ,// Check if necesarry
  textScale: 0.7,
  bigTextScale: 1,
  counterTextScale: 0.4
}