import { raceConfig as cfg, icons } from '../../ui/UI.js'
import config from '../Config.js';

export default {
  height: (config.servers.length * 6) + 3,
  width: cfg.width,
  title: "Linked Servers",
  icon: icons.infoList,
  margin: cfg.margin,
  entries: config.servers.length,
  icons: {
    name: icons.tag,
    blank: icons.blank,
    join: icons.bgGreyOpaque50,
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