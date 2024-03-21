import icons from '../../config/Icons.js'
import ids from '../../config/ComponentIds.js'

const p = tm.utils.palette

export default {
  entries: 15,
  cpsOnFirstPage: 8,
  icon: icons.chartLocal,
  title: "Local Sectors",
  selfColour: `${p.green}F`,
  cpColours: {
    best: `${p.green}F`,
    worst: `${p.red}F`,
    equal: `${p.yellow}F`
  },
  navbar: [
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Dedi Sectors', actionId: ids.dediSectors },
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Live Sectors', actionId: ids.liveSectors },
    { name: 'Live Checkpoints', actionId: ids.liveCheckpoint }
  ],
  stuntsNavbar: [
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Ulti Records', actionId: ids.ultiRecords },
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
  },
  command: {
    aliases: ['sc', 'sectms'],
    help: `Display current map local sectors.`,
    privilege: 0
  }
}