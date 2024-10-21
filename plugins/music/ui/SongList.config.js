import { icons } from '../../ui/UI.js'
const p = tm.utils.palette

export default {
  title: " Song List ",
  icon: icons.musicList,
  iconWidth: 2,
  iconHeight: 2,
  addIcon: icons.musicAdd,
  addIconHover: icons.musicAddHover,
  removeIcon: icons.musicRemove,
  removeIconHover: icons.musicRemoveHover,
  currentSongText: `$${p.green}Currently played`,
  overlayColour: '7777',
  entries: 15,
  defaultText: '--',
  columnProportions: [
    1,
    3,
    3,
    1.7,
    3,
    1
  ],
  navbar: [
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  },
}