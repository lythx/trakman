import icons from '../config/Icons.js'
import cfg from '../config/ResultUi.js'

export default {
  columnProportions: [
    1,
    2.9,
    4.1
  ],
  background: cfg.background,
  headerBackground: "8886",
  format: cfg.format,
  textScale: 0.85,
  padding: 0.2,
  markerWidth: 1.7,
  columnGap: 0.15,
  rowGap: 0.15,
  downloadIcon: icons.download,
  iconVerticalPadding: 0.15,
  iconHorizontalPadding: 0.15,
  markersLeft: {
    you: icons.pageDoubleLeftHover,
    faster: icons.personBetter,
    slower: icons.personWorse
  },
  markersRight: {
    you: icons.pageDoubleRightHover,
    faster: icons.personBetter,
    slower: icons.personWorse
  },
  timeColours: {
    slower: "CCCF",
    faster: `${tm.utils.palette.red}F`,
    you: `${tm.utils.palette.green}F`,
    top: `${tm.utils.palette.yellow}F`
  },
  info: {
    iconWidth: 1.7,
    columns: 5,
    columnWidth: 3,
    bgColor: "0009",
    icon: icons.infoCircle
  },
  noRecordEntryText: '-:--.--'
}