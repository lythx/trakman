import { raceConfig as cfg, icons } from '../../ui/UI.js'

export default {
  height: 33,
  width: cfg.width,
  title: "Linked Servers",
  icon: icons.infoList,
  margin: cfg.margin,
  entries: 5,
  icons: {
    name: icons.tag,
    map: icons.ongoingMap,
    author: icons.personBuilder,
    playerCount: icons.person,
    nextPage: icons.pageRight,
    prevPage: icons.pageLeft,
    nextPageHover: icons.pageRightHover,
    prevPageHover: icons.pageLeftHover,
    gameMode: {
      TimeAttack: icons.clockFire,
      Rounds: icons.roundsMode,
      Cup: icons.trophyClassic,
      Teams: icons.teamsMode,
      Laps: icons.lapsMode,
      Stunts: icons.stuntsMode
    }
  },
  iconBackground: "000a",
  textBackground: cfg.background,
  textScale: 0.9,
  textPadding: 0.15,
  iconWidth: 1.7,
  hidePanel: true
}