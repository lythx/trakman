import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: " Checkpoint Records ",
  icon: icons.clock,
  entries: 14,
  columnProportions: [
    0.7,
    2,
    2,
    2,
    1,
    1.5
  ],
  navbar: [
    { name: 'Sector Records', actionId: ids.sectorRecords },
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Dedi Sectors', actionId: ids.dediSectors },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}