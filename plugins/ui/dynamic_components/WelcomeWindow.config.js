import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'

export default {
  title: "Welcome to Trakman!",
  icon: icons.infoCircle,
  navbar: [
    { name: "Command List", actionId: ids.commandList },
    { name: "Changelog", actionId: ids.changelog },
  ],
  grid: {
    background: "9996",
    margin: 1
  },
  closeButtonWidth: 3,
  closeButtonHeight: 3,
  closeButtonPadding: 0.2,
  closeButtonBackground: "000D"
}