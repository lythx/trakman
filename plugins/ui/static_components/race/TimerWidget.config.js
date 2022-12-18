import icons from '../../config/Icons.js'
import cfg from '../../config/RaceUi.js'
const p = tm.utils.palette

export default {
  height: 6.45,
  width: cfg.width,
  title: "Timer",
  icon: icons.clock,
  margin: cfg.margin,
  background: cfg.background,
  timerActionsPrivilege: 1,
  buttonWidth: 1.8,
  notDynamic: `${p.error}Dynamic timer is disabled.`,
  buttonOrder: ['pause', 'add', 'subtract'],
  icons: {
    pause: icons.pause,
    resume: icons.play,
    add: icons.plus,
    subtract: icons.minus,
  },
  iconsHover: {
    pause: icons.pauseGreen,
    resume: icons.playGreen,
    add: icons.plusGreen,
    subtract: icons.minusGreen
  },
  timeColours: ['FFF', tm.utils.palette.yellow, tm.utils.palette.red],
  colourChangeThresholds: [180, 60], // sec
  iconPadding: 0.3,
  timeAddedOnClick: 5 * 60, //sec
  timeSubtractedOnClick: 5 * 60, //sec
  pause: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}paused ${p.admin}the timer.`,
  resume: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}resumed ${p.admin}the timer.`,
  set: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the remaining time to ${p.highlight}#{time}${p.admin}.`,
}