import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  entries: 15,
  icon: icons.clock,
  title: "Current Checkpoints",
  navbar: [
    { name: "Live Checkpoints", actionId: ids.liveCps },
    { name: "Local Checkpoints", actionId: ids.localCps },
    { name: "Dedi Checkpoints", actionId: ids.dediCps }
  ],
  columnProportions: [
    3,
    3,
    3,
    2,
    2
  ],
  colours: {
    worse: tm.utils.palette.red,
    better: tm.utils.palette.purple,
    equal: tm.utils.palette.yellow
  },
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}