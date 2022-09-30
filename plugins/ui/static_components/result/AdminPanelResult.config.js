import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  height: 6,
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
    previous: icons.pageLeft,
    requeue: icons.payReplay,
    jukebox: icons.mapList,
    shuffle: icons.placeholder
  },
  iconsHover: {
    players: icons.placeholder,
    previous: icons.pageLeftHover,
    requeue: icons.placeholder, // todon icons
    jukebox: icons.placeholder,
    shuffle: icons.placeholder
  },
  messages: {
    requeue: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the ongoing map.`,
    previous: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`, // todo more like replayed not requeued right?
    shuffle: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has shuffled the queue.`
  }
}