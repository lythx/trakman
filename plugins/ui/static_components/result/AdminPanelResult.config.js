import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
  height: 5,
  width: cfg.width,
  privilege: 1,
  margin: cfg.margin,
  background: cfg.background,
  shufflePrivilege: 2,
  title: "Admin Panel",
  icon: icons.gears,
  disabledColour: '333C',
  public: true,
  icons: {
    players: icons.playerList,
    previous: icons.pageLeft,
    requeue: icons.requeue,
    jukebox: icons.mapList,
    shuffle: icons.shuffle
  },
  iconsHover: {
    players: icons.playerListHover,
    previous: icons.pageLeftHover,
    requeue: icons.requeueHover,
    jukebox: icons.mapListHover,
    shuffle: icons.shuffleHover
  },
  messages: {
    previous: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`,
    shuffle: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has shuffled the queue.`
  }
}