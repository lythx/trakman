import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  height: 2.17,
  width: 12.7,
  posX: 12,
  posY: -37,
  margin: cfg.margin,
  side: true,
  rectangleWidth: 7.7,
  icon: icons.placeholder,
  text: 'Checkpoint',
  noCpsText: 'No Checkpoints',
  noCpsWidth: 10.2,
  defaultDifference: '$CCC-:--.--',
  finishText: `${p.tmGreen}Finish`,
  colours: {
    default: '$CCC',
    cpsCollected: p.tmGreen,
    worse: p.tmRed,
    better: "$00F",
    equal: p.tmYellow,
    finish: p.tmGreen
  },
  background: cfg.background,
  finishTextDuration: 3000
}