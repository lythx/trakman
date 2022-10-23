import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'
const p = tm.utils.palette

export default {
  entries: 15,
  cpsOnFirstPage: 10,
  icon: icons.chartDedi,
  title: "Dedi Sectors",
  selfColour: `${p.green}F`,
  cpColours: {
    best: `${p.green}F`,
    worst: `${p.red}F`,
    equal: `${p.yellow}F`
  },
  navbar: [
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
    { name: 'Live Checkpoints', actionId: ids.liveCps },
    { name: 'Live Sectors', actionId: ids.liveSectors }
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