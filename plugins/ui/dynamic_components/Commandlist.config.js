import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: "Command List",
  entries: 15,
  icon: icons.infoList,
  textScale: 0.7,
  navbar: [
    {
      name: "All Commands",
      actionId: ids.commandList,
      privilege: 1
    },
    {
      name: "User Commands",
      actionId: ids.commandList + 100,
      privilege: 1
    },
    {
      name: "Operator Commands",
      actionId: ids.commandList + 200,
      privilege: 1
    },
    {
      name: "Admin Commands",
      actionId: ids.commandList + 300,
      privilege: 2
    },
    {
      name: "Masteradmin Commands",
      actionId: ids.commandList + 400,
      privilege: 3
    },
    {
      name: "Server Owner Commands",
      actionId: ids.commandList + 500,
      privilege: 4
    }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}