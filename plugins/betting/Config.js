import { raceConfig, StaticHeader } from "../ui/UI.js"

export default {
  enabled: false,
  id: 7777777777,
  posX: raceConfig.leftPosition + raceConfig.width + raceConfig.marginBig,
  posY: raceConfig.topBorder - (raceConfig.leftSideOrder[0].height + raceConfig.leftSideOrder[1].height
    + raceConfig.leftSideOrder[2].height + raceConfig.marginBig * 3),
  headerText: `Bet`,
  height: StaticHeader.raceHeight * 3 + raceConfig.margin * 2,
  width: 10,
  options: [100, 200, 300, 500, 1000, 10000],
  margin: raceConfig.margin,
  background: raceConfig.background,
  actionIdOffset: 30,
  timerWidth: 2,
  time: 30
}