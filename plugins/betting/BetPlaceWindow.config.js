import { raceConfig, StaticHeader } from "../ui/UI.js"

const p = tm.utils.palette
export default {
  posX: raceConfig.leftPosition + raceConfig.width + raceConfig.marginBig,
  posY: raceConfig.topBorder - (raceConfig.leftSideOrder[0].height + raceConfig.leftSideOrder[1].height
    + raceConfig.leftSideOrder[2].height + raceConfig.marginBig * 3),
  headerText: `Bet`,
  height: StaticHeader.raceHeight * 3 + raceConfig.margin * 2,
  width: 10,
  options: [2, 200, 300, 500, 1000, 10000], //todo
  margin: raceConfig.margin,
  background: StaticHeader.racePreset.iconBackground,
  actionIdOffset: 30,
  timerWidth: 2,
  countdown: {
    colours: ['FFF', p.yellow, p.red],
    colourChanges: [10, 3]
  }
}