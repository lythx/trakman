import { raceConfig, StaticHeader } from "../ui/UI.js"

const p = tm.utils.palette

const width = 10
export default {
  posX: raceConfig.rightPosition - (width + raceConfig.marginBig),
  posY: raceConfig.topBorder - (raceConfig.rightSideOrder[0].height + raceConfig.rightSideOrder[1].height
    + raceConfig.rightSideOrder[2].height + raceConfig.marginBig * 3),
  headerText: `Bet`,
  height: raceConfig.rightSideOrder[3].height,
  width,
  options: [100, 200, 300, 500, 1000, 10000],
  margin: raceConfig.margin,
  background: StaticHeader.racePreset.iconBackground,
  actionIdOffset: 30,
  timerWidth: 2,
  countdown: {
    colours: ['FFF', p.yellow, p.red],
    colourChanges: [10, 3]
  },
  prizeColour: tm.utils.palette.green
}