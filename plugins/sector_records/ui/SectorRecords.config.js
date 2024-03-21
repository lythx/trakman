import { icons, componentIds as ids } from '../../ui/UI.js'

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
  stuntsNavbar: [
    { name: 'Checkpoint Records', actionId: ids.checkpointRecords },
    { name: 'Ulti Records', actionId: ids.ultiRecords },
    { name: 'Local Checkpoints', actionId: ids.localCps },
    { name: 'Local Sectors', actionId: ids.localSectors },
  ],
  colours: {
    worse: tm.utils.palette.red,
    better: tm.utils.palette.purple,
    equal: tm.utils.palette.yellow
  },
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
  selfColour: tm.utils.palette.green,
  command: {
    aliases: ['sr', 'secrecs'],
    help: `Displays the sector records on the current map.`,
    privilege: 0
  },
  noTimeText: '--:--.-',
  stuntsNoTimeText: '--'
}