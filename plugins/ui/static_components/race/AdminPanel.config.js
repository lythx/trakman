import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'
import { palette as p } from '../../../../src/Trakman.js'

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
  icons: {
    players: icons.playerList,
    restart: icons.placeholder,
    previous: icons.pageLeft,
    requeue: icons.payReplay,
    skip: icons.pageRight,
    endRound: icons.pageLast
  },
  iconsHover: {
    players: icons.placeholder,
    restart: icons.placeholder,
    previous: icons.pageLeftHover,
    requeue: icons.placeholder, // todon icons
    skip: icons.pageRightHover,
    endRound: icons.pageLastHover
  },
  messages: {
    skip: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has skipped the ongoing map.`,
    requeue: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the ongoing map.`,
    previous: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`, // todo more like replayed not requeued right?
    restart: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has restarted the ongoing map.`,
    endRound: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced the ongoing round to end.`
  }
}