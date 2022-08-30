import Paginator from './utils/Paginator.js'
import { Grid, GridCellFunction, GridCellObject } from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import RecordList from './utils/RecordList.js'
import VoteWindow from './utils/VoteWindow.js'
import CONFIG from './config/UIConfig.json' assert { type: 'json' }
import ICONS from './config/Icons.js'
import BACKGROUNDS from './config/Backgrounds.json' assert { type: 'json' }
import IDS from './config/ComponentIds.js'
import { centeredText, horizontallyCenteredText, verticallyCenteredText, rightAlignedText } from './utils/TextUtils.js'
import { getCpTypes } from './utils/GetCpTypes.js'
import { closeButton } from './utils/CloseButton.js'
import { getIcon } from './utils/GetIcon.js'
import { addKeyListener, removeKeyListener } from './utils/KeyListener.js'
import { List } from './utils/List.js'
import StaticHeader from './utils/StaticHeader.js'

const fullScreenListener = (actionId: number, zIndex: number = -100): string => {
  return `<quad posn="-70 50 ${zIndex}" sizen="140 100" action="${actionId}"/>`
}

const stringToObjectProperty = (str: string, obj: any): any => {
  const split: string[] = str.split('.')
  for (const e of split) {
    obj = obj[e]
  }
  return obj
}

const constuctButton = (iconUrl: string, text1: string, text2: string, width: number, height: number, iconWidth: number,
  iconHeight: number, topPadding: number, options?: { equalTexts?: true, actionId?: number, link?: string }): string => {
  const t1: string = options?.equalTexts ?
    horizontallyCenteredText(text1, width, height, { yOffset: 2.4, textScale: 0.36, padding: 0.6 }) :
    horizontallyCenteredText(text1, width, height, { yOffset: 2.2, textScale: 0.5, padding: 0.6 })
  const actionId: string = options?.actionId === undefined ? '' : `action="${options.actionId}"`
  const link: string = options?.link === undefined ? '' : `url="${options.link}"`
  return `<quad posn="0 0 1" sizen="${width} ${height}" bgcolor="${CONFIG.staticHeader.bgColor}" ${actionId} ${link}/>
  <quad posn="${(width - iconWidth) / 2} ${-topPadding} 5" sizen="${iconWidth} ${iconHeight}" image="${iconUrl}"/>
  ${t1}
  ${horizontallyCenteredText(text2, width, height, { yOffset: 3.65, textScale: 0.36, padding: 0.6 })}`
}

export {
  Paginator, Grid, Navbar, VoteWindow, RecordList, GridCellFunction, GridCellObject, List, StaticHeader,
  CONFIG, ICONS, BACKGROUNDS, IDS,
  addKeyListener, removeKeyListener, rightAlignedText, getCpTypes, closeButton, horizontallyCenteredText,
  constuctButton, stringToObjectProperty, fullScreenListener, centeredText,
  verticallyCenteredText, getIcon
}