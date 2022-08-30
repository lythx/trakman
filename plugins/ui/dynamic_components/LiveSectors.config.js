import icons from '../config/Icons.js'

export default {
  entries: 15,
  cpsOnFirstPage: 10,
  icon: icons.chartLocal,
  title: "Live Sectors",
  selfColour: "0F0F",
  cpColours: {
    best: "0F0F",
    worst: "F00F",
    equal: "FF0F"
  },
  navbar: [
    "localCps",
    "dediCps",
    "dediSectors",
    "liveCps",
    "liveSectors"
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