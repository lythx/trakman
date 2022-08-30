import Paginator from './utils/Paginator.js'
import { Grid, GridCellFunction, GridCellObject } from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import RecordList from './utils/RecordList.js'
import VoteWindow from './utils/VoteWindow.js'
import ICONS from './config/Icons.js'
import IDS from './config/ComponentIds.js'
import { centeredText, horizontallyCenteredText, verticallyCenteredText, rightAlignedText } from './utils/TextUtils.js'
import { getCpTypes } from './utils/GetCpTypes.js'
import { closeButton } from './utils/CloseButton.js'
import { addKeyListener, removeKeyListener } from './utils/KeyListener.js'
import { List } from './utils/List.js'
import StaticHeader from './utils/StaticHeader.js'
import staticButton from './utils/StaticButton.js'

const fullScreenListener = (actionId: number, zIndex: number = -100): string => {
  return `<quad posn="-70 50 ${zIndex}" sizen="140 100" action="${actionId}"/>`
}

export {
  Paginator, Grid, Navbar, VoteWindow, RecordList, GridCellFunction, GridCellObject, List, StaticHeader,
  ICONS, IDS,
  addKeyListener, removeKeyListener, rightAlignedText, getCpTypes, closeButton, horizontallyCenteredText,
  staticButton,  fullScreenListener, centeredText,
  verticallyCenteredText
}