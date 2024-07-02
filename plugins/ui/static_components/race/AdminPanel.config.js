import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  height: 5,
  width: cfg.width,
  privilege: 1,
  margin: cfg.margin,
  background: cfg.background,
  title: "Admin Panel",
  icon: icons.gears,
  disabledColour: '333C',
  public: true,
  hidePanel: true,
  icons: {
    players: icons.playerList,
    restart: icons.restart,
    previous: icons.pageLeft,
    requeue: icons.requeue,
    skip: icons.pageRight,
    endRound: icons.pageLast,
    jukebox: icons.mapList
  },
  iconsHover: {
    players: icons.playerListHover,
    restart: icons.restartHover,
    previous: icons.pageLeftHover,
    requeue: icons.requeueHover,
    skip: icons.pageRightHover,
    endRound: icons.pageLastHover,
    jukebox: icons.mapListHover
  },
  messages: {
    skip: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has skipped the ongoing map.`,
    previous: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`,
    restart: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has restarted the ongoing map.`,
    endRound: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced the ongoing round to end.`
  }
}