import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  height: 2.17,
  width: cfg.width,
  // Change this ONLY if you want the widget to be on the side
  useRelative: false,
  posX: 12,
  posY: -37,
  margin: cfg.marginBig,
  side: true,
  rectangleWidth: 7.7,
  icon: icons.waypoint,
  iconBottom: icons.clock,
  text: 'Checkpoint',
  noCpsText: 'No Checkpoints',
  // 1.7 is the squarewidth
  noCpsWidth: cfg.width - cfg.margin - 1.7,
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
    iconBottom: icons.lap,
    iconTop: icons.clockLap,
    lapText: 'Lap',
    lapTextWidth: 2.8,
    lapCounterWidth: 3.1,
    checkpointText: 'CP',
    checkpointTextWidth: 2.8,
  },
  background: cfg.background,
  finishTextDuration: 3000,
  hidePanel: false,
}