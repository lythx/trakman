import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: " Sector Records ",
  icon: icons.clock,
  entries: 13,
  columnProportions: [
    0.7,
    2,
    2,
    2,
    1,
    1.5
  ],
  navbar: [
    { name: 'Checkpoint Records', actionId: ids.checkpointRecords },
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Dedi Sectors', actionId: ids.dediSectors },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
  ],
  colours: {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  },
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}