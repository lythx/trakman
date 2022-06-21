import Paginator from './utils/Paginator.js'
import Grid from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import DropdownMenu from './utils/DropdownMenu.js'
import CONFIG from './config/UIConfig.json' assert { type: 'json' }
import ICONS from './config/Icons.json' assert { type: 'json' }
import BACKGROUNDS from './config/Backgrounds.json' assert { type: 'json' }
import IDS from './config/ComponentIds.json' assert { type: 'json' }

import { TRAKMAN as TM } from '../../src/Trakman.js'

const gridCell = (width: number, height: number, margin: number, color: string = '5556'): string => {
  return `<quad posn="${margin} -${margin} 1" sizen="${width - margin} ${height - margin}" bgcolor="${color}"/>`
}

const centeredText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, margin?: number, xOffset?: number, yOffset?: number }) => {
  const textScale = options?.textScale ?? 0.7
  const margin = options?.margin ?? 1
  const posX = options?.xOffset === undefined ? parentWidth / 2 : (parentWidth / 2) + options?.xOffset
  const posY = options?.yOffset === undefined ? parentHeight / 2 : (parentWidth / 2) + options?.yOffset
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (margin * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
}

const footerCloseButton = (width: number, closeId: number): string => {
  return `<quad posn="${width / 2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${closeId}" 
    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
}

const headerIconTitleText = (title: string, width: number, height: number, iconUrl: string, iconWidth: number, iconHeight: number, rightText: string, optionalParams?: { titleScale?: number, rightTextScale?: number }): string => {
  const titleScale = optionalParams?.titleScale ?? 1
  const rightTextScale = optionalParams?.rightTextScale ?? 0.8
  return `<quad posn="2 -${height / 2} 1" sizen="${iconWidth} ${iconHeight}" halign="center" valign="center" image="${iconUrl}"/>
        <label posn="${width / 2} -${height / 2} 1" sizen="${width * (1 / titleScale)} ${height}" halign="center" valign="center" scale="${titleScale}" text="${title}"/>
        <label posn="${width - 3} -${height / 2} 1" sizen="${width * (1 / rightTextScale)} ${height}" halign="center" valign="center" scale="${rightTextScale}" text="${rightText}"/>`
}

const staticHeader = (text: string, icon: string,
  options?: {
    iconWidth?: number, iconHeight?: number,
    textScale?: number, rectangleWidth?: number, horizontalPadding?: number, verticalPadding?: number,
    iconVerticalPadding?: number, iconHorizontalPadding?: number, centerText?: true,
    iconBackground?: string, textBackgrund?: string
  }) => {
  const CFG = CONFIG.staticHeader
  const textScale = options?.textScale ?? CFG.textScale
  const horizontalPadding = options?.horizontalPadding ?? CFG.horizontalPadding
  const rectWidth = options?.rectangleWidth ?? CFG.rectangleWidth
  const label = options?.centerText ? centeredText(CFG.format + text, rectWidth, CFG.height, { textScale, margin: horizontalPadding, xOffset: CFG.squareWidth + CONFIG.static.marginSmall }) :
    `<label posn="${CFG.squareWidth + horizontalPadding} -${options?.verticalPadding ?? CFG.verticalPadding} 2" 
  sizen="${(CFG.rectangleWidth * (1 / textScale)) - (horizontalPadding * 2)} 2" scale="${textScale}" text="${CFG.format}${text}"/>`
  return `
  <quad posn="0 0 1" sizen="${CFG.squareWidth} ${CFG.height}" bgcolor="${options?.iconBackground ?? CFG.iconBgColor}"/>
  <quad posn="${options?.iconHorizontalPadding ?? CFG.iconHorizontalPadding} -${options?.iconVerticalPadding ?? CFG.iconVerticalPadding} 2"
   sizen="${options?.iconWidth ?? CFG.iconWidth} ${options?.iconHeight ?? CFG.iconHeight}" image="${icon}"/>
  <quad posn="${CFG.squareWidth + CFG.margin} 0 1" sizen="${rectWidth} ${CFG.height}" bgcolor="${options?.textBackgrund ?? CFG.bgColor}"/>
  ${label}
 `
}

const calculateStaticPositionY = (widgetName: string): number => {
  const order = (CONFIG as any)[widgetName].side === true ? CONFIG.static.rightSideOrder : CONFIG.static.leftSideOrder
  let positionSum = 0
  for (const [k, v] of order.entries()) {
    if (v === widgetName) { break }
    positionSum += (CONFIG as any)?.[v].height + CONFIG.static.marginBig
  }
  return CONFIG.static.topBorder - positionSum
}

export { Paginator, Grid, Navbar, DropdownMenu, CONFIG, ICONS, BACKGROUNDS, IDS, staticHeader, gridCell, centeredText, footerCloseButton, headerIconTitleText, calculateStaticPositionY }