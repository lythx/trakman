import icons from '../config/Icons.js'
import cfg from '../config/RaceUi.js'
import header from './StaticHeaderRace.config.js'
const p = tm.utils.palette

export default {
  title: " Vote ",
  width: 25,
  height: 10, // Without the admin buttons
  margin: cfg.margin,
  background: cfg.background,
  posX: cfg.leftPosition + cfg.marginBig + cfg.width,
  posY: cfg.topBorder - (14.5 + cfg.marginBig), // add buttons widget height
  headerHeight: header.height,
  buttonHeight: 2.5,
  buttonWidth: 2.5,
  headerTextXOffset: 0.2, // Check if necesarry
  textScale: 0.7,
  bigTextScale: 1,
  counterTextScale: 0.4,
  F5Button: icons.F5,
  F6Button: icons.F6,
  colours: {
    yes: p.green,
    no: p.red,
    timer: ['FFF', p.yellow, p.red]
  },
  timerColourChanges: [20, 5],
  message: `Votes needed to pass: #{colour}#{amount}$FFF.`,
  adminButtons: {
    height: 3,
    width: 6,
    cancelText: `$${p.red}Cancel`,
    passText: `$${p.green}Pass`,
    textScale: 1.2
  }
}