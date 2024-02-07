import { icons, raceConfig as cfg } from '../../ui/UI.js'

export default {
  height: 7,
  title: 'Current Song',
  icon: icons.music,
  margin: cfg.margin,
  width: cfg.width,
  background: cfg.background,
  noDataText: "--",
  iconBackground: "000a",
  icons: {
    name: icons.disk,
    author: icons.personMusic
  },
  side: true,
  textBackground: cfg.background,
  textScale: 0.9,
  textPadding: 0.15,
  iconWidth: 1.7,
  hidePanel: true
}