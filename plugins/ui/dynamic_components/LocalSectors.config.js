import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  entries: 15,
  cpsOnFirstPage: 8,
  icon: icons.chartLocal,
  title: "Local Sectors",
  selfColour: "0F0F",
  cpColours: {
    best: "0F0F",
    worst: "F00F",
    equal: "FF0F"
  },
  navbar: [
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Dedi Sectors', actionId: ids.dediSectors },
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Live Sectors', actionId: ids.liveSectors },
    { name: 'Live Checkpoints', actionId: ids.liveCheckpoint }
  ],
  cpPaginatorMargin: 0.25,
  startCellWidth: 2,
  indexCellWidth: 1,
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}