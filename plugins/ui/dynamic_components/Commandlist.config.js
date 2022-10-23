import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: "Command List",
  entries: 15,
  icon: icons.infoList,
  textScale: 0.7,
  userNavbar: [
    {
      name: "Info",
      actionId: ids.welcomeWindow
    }
  ],
  navbar: [
    {
      name: "All Commands",
      actionId: ids.commandList
    },
    {
      name: "User Commands",
      actionId: ids.commandList + 100
    },
    {
      name: "Operator Commands",
      actionId: ids.commandList + 200
    },
    {
      name: "Admin Commands",
      actionId: ids.commandList + 300
    },
    {
      name: "Masteradmin Commands",
      actionId: ids.commandList + 400
    },
    {
      name: "Server Owner Commands",
      actionId: ids.commandList + 500
    }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}