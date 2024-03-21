import { icons, componentIds as ids } from '../../ui/UI.js'
const p = tm.utils.palette

export default {
  entries: 15,
  cpsOnFirstPage: 10,
  icon: icons.chartDedi,
  title: "Ultimania Records",
  selfColour: `${p.green}F`,
  cpColours: {
    best: `${p.green}F`,
    worst: `${p.red}F`,
    equal: `${p.yellow}F`
  },
  navbar: [
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
    { name: 'Live Checkpoints', actionId: ids.liveCps },
    { name: 'Live Sectors', actionId: ids.liveSectors }
  ],
  cpPaginatorMargin: 0.25,
  columnProportions: [0.5, 2, 2, 2, 1],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  command: {
    aliases: ['urc', 'ultirecs'],
    help: `Display current map ultimania records.`,
    privilege: 0
  }
}