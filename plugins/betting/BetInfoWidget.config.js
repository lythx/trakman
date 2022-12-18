import { icons, raceConfig } from "../ui/UI.js"

export default {
  posX: raceConfig.rightPosition,
  posY: raceConfig.topBorder - raceConfig.rightSideOrder.reduce((acc, cur) =>
    acc += cur.height, 0),
  icon: icons.cash,
  side: true,
  title: `Bet Prize`,
  width: raceConfig.width,
  prizeWidth: 3
}