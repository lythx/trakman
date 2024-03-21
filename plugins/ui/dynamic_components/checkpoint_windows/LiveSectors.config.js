import icons from '../../config/Icons.js'
import ids from '../../config/ComponentIds.js'

const p = tm.utils.palette

export default {
  entries: 15,
  cpsOnFirstPage: 10,
  icon: icons.chartLocal,
  title: "Live Sectors",
  selfColour: `${p.green}F`,
  cpColours: {
    best: `${p.green}F`,
    worst: `${p.red}F`,
    equal: `${p.yellow}F`
  },
  navbar: [
    { name: 'Live Checkpoints', actionId: ids.liveCps },
    { name: 'Dedi Sectors', actionId: ids.dediSectors },
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
    { name: 'Local Checkpoints', actionId: ids.localCps },
  ],
  stuntsNavbar: [
    { name: 'Live Checkpoints', actionId: ids.liveCps },
    { name: 'Ulti Records', actionId: ids.ultiRecords },
    { name: 'Local Sectors', actionId: ids.localSectors },
    { name: 'Local Checkpoints', actionId: ids.localCps },
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
    aliases: ['lsc', 'livesectms'],
    help: `Display current map live sectors.`,
    privilege: 0
  }
}