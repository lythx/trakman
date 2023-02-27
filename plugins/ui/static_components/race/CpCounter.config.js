import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  height: 2.17,
  width: 14.4,
  posX: 12,
  posY: -37,
  margin: cfg.margin,
  side: true,
  rectangleWidth: 7.7,
  icon: icons.waypoint,
  iconBottom: icons.clock,
  text: 'Checkpoint',
  noCpsText: 'No Checkpoints',
  noCpsWidth: 10.2,
  defaultDifference: '$CCC-:--.--',
  finishText: `$${p.green}Finish`,
  colours: {
    default: 'CCC',
    cpsCollected: p.green,
    worse: p.red,
    better: p.purple,
    equal: p.yellow,
    finish: p.green
  },
  lap: {
    icon: icons.placeholder,
    lapText: 'Lap',
    lapTextWidth: 2.8,
    lapCounterWidth: 3.1,
    checkpointText: 'CP',
    checkpointTextWidth: 2.8,
  },
  background: cfg.background,
  finishTextDuration: 3000
}