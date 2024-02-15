import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  entries: 12,
  teamsEntries: 15,
  roundsEntries: 7,
  cupEntries: 7,
  lapsEntries: 7,
  entryHeight: 2.15,
  width: cfg.width,
  title: "Ultimania Records",
  icon: icons.chartDedi,
  margin: cfg.margin,
  topCount: 5,
  teamsTopCount: 5,
  roundsTopCount: 3,
  cupTopCount: 3,
  lapsTopCount: 3,
  displayNoRecordEntry: true,
  hidePanel: true,
  maxRecordCount: 5000,
  noRecordEntryText: '--'
}
