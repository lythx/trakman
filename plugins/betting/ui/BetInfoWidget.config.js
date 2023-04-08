import { icons, raceConfig } from "../../ui/UI.js"

export default {
  posX: raceConfig.rightPosition,
  side: true,
  // If true overrides posY prop and places the widget as last component
  placeAsLastComponent: true,
  posY: 0,
  icon: icons.cash,
  margin: raceConfig.margin,
  title: `Bet Prize`,
  width: raceConfig.width,
  prizeWidth: 5,
  prizeColour: tm.utils.palette.green,
  topBorder: raceConfig.topBorder, // used for Y positioning
  marginBig: raceConfig.marginBig
}