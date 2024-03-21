import { icons, componentIds as ids } from '../../ui/UI.js'

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
  stuntsNavbar: [
    { name: 'Sector Records', actionId: ids.sectorRecords },
    { name: 'Ulti Records', actionId: ids.ultiRecords },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  selfColour: tm.utils.palette.green,
  command: {
    aliases: ['cpr', 'cprecs'],
    help: `Displays the checkpoint records on the current map.`,
    privilege: 0
  },
  noTimeText: '--:--.-',
  stuntsNoTimeText: '--'
}