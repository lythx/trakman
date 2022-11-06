import ids from '../config/ComponentIds.js'
import icons from '../config/Icons.js'

export default {
  title: "Changelog",
  icon: icons.codeBranch,
  navbar: [
    { name: 'Info', actionId: ids.welcomeWindow },
    { name: 'Command List', actionId: ids.commandList }
  ],
  textScale: 1.4,
  tileBackground: "9996",
  marginBig: 1,
  entries: 2,
  versionWidth: 6,
  headerHeight: 3,
  lineCount: 19,
  lineCharacterLimit: 60
}