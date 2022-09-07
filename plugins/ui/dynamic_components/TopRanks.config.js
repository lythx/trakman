import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: "Top Ranks",
  icon: icons.chartLocal,
  gridColumns:  [0.8, 4, 3, 3, 0.8, 4, 3, 3],
  entries: 30, // Has to be even number
  precision: 4,
  navbar: [
    { name: "Command List", actionId: ids.commandList }, // TODO
    { name: "Changelog", actionId: ids.changelog },
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  selfColour: "0F0"
}