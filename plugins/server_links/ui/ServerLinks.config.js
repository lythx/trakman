import { raceConfig as cfg, icons } from '../../ui/UI.js'

export default {
  height: 33,
  width: cfg.width,
  title: "Server Neighbourhood",
  icon: icons.chartLocal,
  margin: cfg.margin,
  entries: 5,
  icons: {
    name: icons.tag,
    map: icons.ongoingMap,
    author: icons.personBuilder,
    playerCount: icons.person,
    environment: icons.carExplode,
    gameMode: icons.placeholder
  },
  iconBackground: "000a",
  textBackground: cfg.background,
  textScale: 0.9,
  textPadding: 0.15,
  iconWidth: 1.7
}