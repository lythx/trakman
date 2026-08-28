import { loadConfig } from "../../../../src/ConfigLoader.js"
import icons from '../../config/Icons.js'
import ids from '../../config/ComponentIds.js'

const p = tm.utils.palette

const defaultConfig = {
  entries: 15,
  cpsOnFirstPage: 8,
  icon: icons.chartLocal,
  title: 'Local Checkpoints',
  selfColour: `${p.green}F`,
  cpColours: {
    best: `${p.green}F`,
    worst: `${p.red}F`,
    equal: `${p.yellow}F`
  },
  navbar: [{
    name: 'Local Sectors',
    actionId: ids.localSectors
  }, {
    name: 'Dedi Checkpoints',
    actionId: ids.dediCps
  }, {
    name: 'Dedi Sectors',
    actionId: ids.dediSectors
  }, {
    name: 'Live Checkpoints',
    actionId: ids.liveCps
  }, {
    name: 'Live Sectors',
    actionId: ids.liveSectors
  }],
  stuntsNavbar: [{
    name: 'Local Sectors',
    actionId: ids.localSectors
  }, {
    name: 'Ulti Records',
    actionId: ids.ultiRecords
  }, {
    name: 'Live Checkpoints',
    actionId: ids.liveCps
  }, {
    name: 'Live Sectors',
    actionId: ids.liveSectors
  }],
  cpPaginatorMargin: 0.25,
  startCellWidth: 2,
  indexCellWidth: 1,
  grid: {
    background: '9996',
    margin: 0.15,
    headerBackground: '333C'
  },
  command: {
    aliases: ['cp', 'cptms', 'recs'],
    help: `Display current map local checkpoints.`,
    privilege: 0
  }
}

export default await loadConfig(defaultConfig, import.meta.url)
