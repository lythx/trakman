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
      actionId: 1000
    },
    {
      name: "User Commands",
      actionId: 1100
    },
    {
      name: "Operator Commands",
      actionId: 1200
    },
    {
      name: "Admin Commands",
      actionId: 1300
    },
    {
      name: "Masteradmin Commands",
      actionId: 1400
    },
    {
      name: "Server Owner Commands",
      actionId: 1500
    }
  ],
  grid: {
    background: "9996",
    margin: 0.15,
    headerBackground: "333C"
  }
}