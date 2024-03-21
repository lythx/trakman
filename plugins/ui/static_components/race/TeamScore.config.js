import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 5.5,
  width: cfg.width,
  margin: cfg.margin,
  title: "Team Score",
  icon: icons.teamsMode,
  entries: 3, 
  columnProportions: [
    1,
    1,
    2.8,
    4
  ],
  text: { specialFont: true, textScale: 0.5 },
  colours: {
    left: tm.utils.palette.purple + '8',
    middle: cfg.background,
    right: tm.utils.palette.red + '8'
  },
  topCount: 3,
  displayNoRecordEntry: false,
  noMaxScore: '-',
  hidePanel: true
}