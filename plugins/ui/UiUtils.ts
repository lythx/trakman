import Paginator from './utils/Paginator.js'
import { Grid, GridCellFunction, GridCellObject } from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import DropdownMenu from './utils/DropdownMenu.js'
import RecordList from './utils/RecordList.js'
import VoteWindow from './utils/VoteWindow.js'
import CONFIG from './config/UIConfig.json' assert { type: 'json' }
import RESULTCONFIG from './config/ResultUIConfig.json' assert { type: 'json' }
import ICONS from './config/Icons.json' assert { type: 'json' }
import BACKGROUNDS from './config/Backgrounds.json' assert { type: 'json' }
import IDS from './config/ComponentIds.json' assert { type: 'json' }
import { centeredText, horizontallyCenteredText, verticallyCenteredText, rightAlignedText } from './utils/TextUtils.js'
import { staticHeader, resultStaticHeader } from './utils/StaticHeader.js'
import { getCpTypes } from './utils/GetCpTypes.js'
import { closeButton } from './utils/CloseButton.js'
import { getIcon } from './utils/GetIcon.js'
import { addKeyListener, removeKeyListener } from './utils/KeyListener.js'
import {List } from './utils/List.js'


const getStaticPosition = (widgetName: string): { x: number, y: number } => {
  const side = (CONFIG as any)[widgetName].side === true
  const order: string[] = side ? CONFIG.static.rightSideOrder : CONFIG.static.leftSideOrder
  let positionSum: number = 0
  for (const [k, v] of order.entries()) {
    if (v === widgetName) { break }
    positionSum += (CONFIG as any)?.[v]?.height + CONFIG.marginBig
  }
  return { y: CONFIG.static.topBorder - positionSum, x: side ? CONFIG.static.rightPosition : CONFIG.static.leftPosition }
}

const getResultPosition = (widgetName: string): { x: number, y: number } => {
  const side = (RESULTCONFIG as any)[widgetName].side === true
  const order: string[] = side ? RESULTCONFIG.static.rightSideOrder : RESULTCONFIG.static.leftSideOrder
  let positionSum: number = 0
  for (const [k, v] of order.entries()) {
    if (v === widgetName) { break }
    positionSum += (RESULTCONFIG as any)?.[v]?.height + RESULTCONFIG.marginBig
  }
  return { y: RESULTCONFIG.static.topBorder - positionSum, x: side ? RESULTCONFIG.static.rightPosition : RESULTCONFIG.static.leftPosition }
}

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
  Paginator, Grid, Navbar, DropdownMenu, VoteWindow, RecordList, GridCellFunction, GridCellObject,List,
  CONFIG, ICONS, BACKGROUNDS, IDS,RESULTCONFIG,
  addKeyListener, removeKeyListener, rightAlignedText, getCpTypes, closeButton, horizontallyCenteredText,
  constuctButton, stringToObjectProperty, fullScreenListener, staticHeader, centeredText, getStaticPosition,
  verticallyCenteredText, getIcon, getResultPosition, resultStaticHeader
}