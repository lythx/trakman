import { raceConfig, StaticHeader } from "../../ui/UI.js"

const p = tm.utils.palette

const width = 10
export default {
  posX: raceConfig.rightPosition - (width + raceConfig.marginBig),
  headerText: `Bet`,
  // To position the widget next to side ui widgets set these properties and keep staticPos props null
  relativePos: {
    side: true,
    widgetNumber: 3
  },
  // To set fixed position set these props to numbers
  staticPos: {
    posY: null,
    height: null
  },
  width,
  options: [50, 100, 200, 500, 1000, 10000],
  margin: raceConfig.margin,
  background: StaticHeader.racePreset.iconBackground,
  actionIdOffset: 30,
  timerWidth: 2,
  countdown: {
    colours: ['FFF', p.yellow, p.red],
    colourChanges: [10, 3]
  },
  prizeColour: tm.utils.palette.green,
  betAcceptedText: {
    scale: 1,
    yOffset: -0.03
  },
  prizeText: {
    scale: 1.1,
    yOffset: -0.03
  },
  betAmountText: {
    textScale: 1.3
  },
  countdownText: {
    specialFont: true,
    textScale: 0.27
  },
  topBorder: raceConfig.topBorder, // used for Y positioning
  marginBig: raceConfig.marginBig
}