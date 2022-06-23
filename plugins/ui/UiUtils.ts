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

const centeredText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }) => {
  const textScale = options?.textScale ?? 0.7
  const padding = options?.padding ?? 1
  const posX = options?.xOffset === undefined ? parentWidth / 2 : (parentWidth / 2) + options?.xOffset
  const posY = options?.yOffset === undefined ? parentHeight / 2 : (parentHeight / 2) + options?.yOffset
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
}

const verticallyCenteredText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }) => {
  const textScale = options?.textScale ?? 0.7
  const posX = options?.xOffset === undefined ? 0 : options?.xOffset
  const posY = options?.yOffset === undefined ? parentHeight / 2.2 : (parentHeight / 2.2) + options?.yOffset
  const padding = options?.padding ?? 0.2
  return `<label posn="${padding + posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center"/>`
}

const footerCloseButton = (width: number, closeId: number): string => {
  return `<quad posn="${width / 2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${closeId}" 
    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
}

const headerIconTitleText = (title: string, width: number, height: number, iconUrl: string, iconWidth: number, iconHeight: number, rightText: string, options?: { titleScale?: number, rightTextScale?: number }): string => {
  const titleScale = options?.titleScale ?? 1
  const rightTextScale = options?.rightTextScale ?? 0.8
  return `<quad posn="2 -${height / 2} 1" sizen="${iconWidth} ${iconHeight}" halign="center" valign="center" image="${iconUrl}"/>
        <label posn="${width / 2} -${height / 2} 1" sizen="${width * (1 / titleScale)} ${height}" halign="center" valign="center" scale="${titleScale}" text="${title}"/>
        <label posn="${width - 3} -${height / 2} 1" sizen="${width * (1 / rightTextScale)} ${height}" halign="center" valign="center" scale="${rightTextScale}" text="${rightText}"/>`
}

const staticHeader = (text: string, icon: string,
  options?: {
    iconWidth?: number, iconHeight?: number,
    textScale?: number, rectangleWidth?: number, horizontalPadding?: number, verticalPadding?: number,
    iconVerticalPadding?: number, iconHorizontalPadding?: number, centerText?: true,
    iconBackground?: string, textBackgrund?: string, centerVertically?: true
  }) => {
  const CFG = CONFIG.staticHeader
  const textScale = options?.textScale ?? CFG.textScale
  const horizontalPadding = options?.horizontalPadding ?? CFG.horizontalPadding
  const rectWidth = options?.rectangleWidth ?? CFG.rectangleWidth
  let label = ''
  if (options?.centerText) {
    label = centeredText(CFG.format + text, rectWidth, CFG.height, { textScale, padding: horizontalPadding, xOffset: CFG.squareWidth + CONFIG.static.marginSmall })
  } else if (options?.centerVertically) {
    label = verticallyCenteredText(CFG.format + text, rectWidth, CFG.height, { textScale, padding: horizontalPadding, xOffset: CFG.squareWidth + CONFIG.static.marginSmall })
  } else {
    label = `<label posn="${CFG.squareWidth + horizontalPadding} -${options?.verticalPadding ?? CFG.verticalPadding} 2" 
    sizen="${(CFG.rectangleWidth * (1 / textScale)) - (horizontalPadding * 2)} 2" scale="${textScale}" text="${CFG.format}${text}"/>`
  }
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
    positionSum += (CONFIG as any)?.[v]?.height + CONFIG.static.marginBig
  }
  return CONFIG.static.topBorder - positionSum
}

const fullScreenListener = (actionId: number, zIndex: number = -100): string => {
  return `<quad posn="-70 50 ${zIndex}" sizen="140 100" action="${actionId}"/>`
}

const stringToObjectProperty = (str: string, obj: any) => {
  const split = str.split('.')
  for (const e of split) {
    obj = obj[e]
  }
  return obj
}

const getBestWorstEqualCps = (cps: number[][]): ('best' | 'worst' | 'equal' | undefined)[][] => {
  if(cps.length === 0) {
    return []
  }
  const cpTypes: ('best' | 'worst' | 'equal' | undefined)[][] = Array.from(Array(cps[0].length), () => [])
  for (const [i, e] of cps.entries()) {
    if (cps?.[0]?.length < 2) {
      break
    }
    const max = Math.max(...e.filter(a => !isNaN(a)))
    const worst = e.filter(a => a === max)
    const min = Math.min(...e.filter(a => !isNaN(a)))
    const best = e.filter(a => a === min)
    if (max === min) {
      continue
    }
    if (worst.length === 1) {
      cpTypes[e.indexOf(worst[0])][i] = 'worst'
    }
    if (best.length === 1) {
      cpTypes[e.indexOf(best[0])][i] = 'best'
    } else {
      const indexes = e.reduce((acc: number[], cur, i) => cur === min ? [...acc, i] : acc, [])
      for (const index of indexes) {
        cpTypes[index][i] = 'equal'
      }
    }
  }
  return cpTypes
}

export { Paginator, Grid, Navbar, DropdownMenu, CONFIG, ICONS, BACKGROUNDS, IDS,getBestWorstEqualCps, stringToObjectProperty, fullScreenListener, staticHeader, gridCell, centeredText, footerCloseButton, headerIconTitleText, calculateStaticPositionY, verticallyCenteredText }