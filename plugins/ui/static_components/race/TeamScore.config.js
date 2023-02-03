import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 5.5,
  width: cfg.width,
  margin: cfg.margin,
  title: "Team Score",
  icon: icons.placeholder,
  entries: 3,
  columnProportions: [
    1,
    1,
    2.8,
    4
  ],
  colours: {
    left: tm.utils.palette.purple + '8',
    middle: cfg.background,
    right: tm.utils.palette.red + '8'
  },
  topCount: 3,
  displayNoRecordEntry: false
}