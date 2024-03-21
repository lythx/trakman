import icons from '../../config/Icons.js'
import ids from '../../config/ComponentIds.js'

const p = tm.utils.palette

export default {
  entries: 15,
  cpsOnFirstPage: 10,
  icon: icons.chartLocal,
  title: "Live Checkpoints",
  selfColour: `${p.green}F`,
  cpColours: {
    best: `${p.green}F`,
    worst: `${p.red}F`,
    equal: `${p.yellow}F`
  },
  navbar: [
    { name: 'Live Sectors', actionId: ids.liveSectors },
    { name: 'Dedi Checkpoints', actionId: ids.dediCps },
    { name: 'Dedi Sectors', actionId: ids.dediSectors },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors }
  ],
  stuntsNavbar: [
    { name: 'Live Sectors', actionId: ids.liveSectors },
    { name: 'Ulti Records', actionId: ids.ultiRecords },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors }
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
    aliases: ['lcp', 'livecptms', 'liverecs'],
    help: `Display the current map live checkpoints.`,
    privilege: 0
  }
}