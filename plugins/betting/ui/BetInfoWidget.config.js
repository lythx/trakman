import { icons, raceConfig } from "../../ui/UI.js"

export default {
  posX: raceConfig.rightPosition,
  posY: 10, //raceConfig.topBorder - raceConfig.rightSideOrder.reduce((acc, cur) =>
    //acc += cur.height + raceConfig.marginBig, 0), // TODO
  icon: icons.cash,
  side: true,
  margin: raceConfig.margin,
  title: `Bet Prize`,
  width: raceConfig.width,
  prizeWidth: 5,
  prizeColour: tm.utils.palette.green
}