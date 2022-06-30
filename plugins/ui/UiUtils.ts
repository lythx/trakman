import Paginator from './utils/Paginator.js'
import Grid from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import DropdownMenu from './utils/DropdownMenu.js'
import RecordList from './utils/RecordList.js'
import CONFIG from './config/UIConfig.json' assert { type: 'json' }
import ICONS from './config/Icons.json' assert { type: 'json' }
import BACKGROUNDS from './config/Backgrounds.json' assert { type: 'json' }
import IDS from './config/ComponentIds.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../src/Trakman.js'


const gridCell = (width: number, height: number, margin: number, color: string = '5556'): string => {
  return `<quad posn="${margin} -${margin} 1" sizen="${width - margin} ${height - margin}" bgcolor="${color}"/>`
}

const centeredText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? 0.7
  const padding: number = options?.padding ?? 1
  const posX: number = options?.xOffset === undefined ? parentWidth / 2 : (parentWidth / 2) + options?.xOffset
  const posY: number = options?.yOffset === undefined ? parentHeight / 2 : (parentHeight / 2) + options?.yOffset
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
}

const verticallyCenteredText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? 0.7
  const posX: number = options?.xOffset === undefined ? 0 : options?.xOffset
  const posY: number = options?.yOffset === undefined ? parentHeight / 2.2 : (parentHeight / 2.2) + options?.yOffset
  const padding: number = options?.padding ?? 0.2
  return `<label posn="${padding + posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center"/>`
}

const horizontallyCenteredText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? 0.7
  const posX: number = options?.xOffset === undefined ? parentWidth / 2 : (parentWidth / 2) + options?.xOffset
  const posY: number = options?.yOffset === undefined ? 0 : options?.yOffset
  const padding: number = options?.padding ?? 0.2
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" halign="center"/>`
}

const rightAlignedText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? 0.7
  const padding: number = options?.padding ?? 1
  const posX: number = options?.xOffset === undefined ? parentWidth - 0.5 : (parentWidth) + options?.xOffset - 0.5
  const posY: number = options?.yOffset === undefined ? parentHeight / 2 : (parentHeight / 2) + options?.yOffset
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center" halign="right"/>`
}

const footerCloseButton = (width: number, closeId: number): string => {
  return `<quad posn="${width / 2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${closeId}" 
    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
}

const headerIconTitleText = (title: string, width: number, height: number, iconUrl: string, iconWidth: number, iconHeight: number, rightText: string, options?: { titleScale?: number, rightTextScale?: number }): string => {
  const titleScale: number = options?.titleScale ?? 1
  const rightTextScale: number = options?.rightTextScale ?? 0.8
  return `<quad posn="2 -${height / 2} 1" sizen="${iconWidth} ${iconHeight}" halign="center" valign="center" image="${iconUrl}"/>
        <label posn="${width / 2} -${height / 2} 1" sizen="${width * (1 / titleScale)} ${height}" halign="center" valign="center" scale="${titleScale}" text="${title}"/>
        <label posn="${width - 3} -${height / 2} 1" sizen="${width * (1 / rightTextScale)} ${height}" halign="center" valign="center" scale="${rightTextScale}" text="${rightText}"/>`
}

const staticHeader = (text: string, icon: string, side: boolean,
  options?: {
    iconWidth?: number, iconHeight?: number,
    textScale?: number, rectangleWidth?: number, horizontalPadding?: number, verticalPadding?: number,
    iconVerticalPadding?: number, iconHorizontalPadding?: number, centerText?: true,
    iconBackground?: string, textBackgrund?: string, centerVertically?: true
  }): string => {
  const CFG = CONFIG.staticHeader
  const textScale: number = options?.textScale ?? CFG.textScale
  const horizontalPadding: number = options?.horizontalPadding ?? CFG.horizontalPadding
  const rectWidth: number = options?.rectangleWidth ?? CFG.rectangleWidth
  if (side) {
    let label: string = ''
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
  } else {
    let label: string = ''
    if (options?.centerText) {
      label = centeredText(CFG.format + text, rectWidth, CFG.height, { textScale, padding: horizontalPadding })
    } else if (options?.centerVertically) {
      label = verticallyCenteredText(CFG.format + text, rectWidth, CFG.height, { textScale, padding: horizontalPadding })
    } else {
      label = rightAlignedText(CFG.format + text, CFG.rectangleWidth, CFG.height, { textScale, yOffset: -0.1 })
    }
    return `<quad posn="0 0 1" sizen="${rectWidth} ${CFG.height}" bgcolor="${options?.textBackgrund ?? CFG.bgColor}"/>
      ${label}
      <quad posn="${rectWidth + CFG.margin} 0 1" sizen="${CFG.squareWidth} ${CFG.height}" bgcolor="${options?.iconBackground ?? CFG.iconBgColor}"/>
      <quad posn="${rectWidth + CFG.margin + (options?.iconHorizontalPadding ?? CFG.iconHorizontalPadding)} -${options?.iconVerticalPadding ?? CFG.iconVerticalPadding} 2"
       sizen="${options?.iconWidth ?? CFG.iconWidth} ${options?.iconHeight ?? CFG.iconHeight}" image="${icon}"/>
     `
  }

}

const calculateStaticPositionY = (widgetName: string): number => {
  const order: string[] = (CONFIG as any)[widgetName].side === true ? CONFIG.static.rightSideOrder : CONFIG.static.leftSideOrder
  let positionSum: number = 0
  for (const [k, v] of order.entries()) {
    if (v === widgetName) { break }
    positionSum += (CONFIG as any)?.[v]?.height + CONFIG.static.marginBig
  }
  return CONFIG.static.topBorder - positionSum
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

const constuctButton = (iconUrl: string, text1: string, text2: string, width: number, height: number, iconWidth: number, iconHeight: number, topPadding: number,
  options?: { equalTexts?: true, actionId?: number, link?: string }): string => {
  const t1: string = options?.equalTexts ?
    horizontallyCenteredText(text1, width, height, { yOffset: 2.4, textScale: 0.43, padding: 0.6 }) :
    horizontallyCenteredText(text1, width, height, { yOffset: 2.2, textScale: 0.52, padding: 0.6 })
  const actionId: string = options?.actionId === undefined ? '' : `action="${options.actionId}"`
  const link: string = options?.link === undefined ? '' : `url="${options.link}"`
  return `<quad posn="0 0 1" sizen="${width} ${height}" bgcolor="${CONFIG.staticHeader.bgColor}" ${actionId} ${link}/>
  <quad posn="${(width - iconWidth) / 2} ${-topPadding} 5" sizen="${iconWidth} ${iconHeight}" image="${iconUrl}"/>
  ${t1}
  ${horizontallyCenteredText(text2, width, height, { yOffset: 3.65, textScale: 0.43, padding: 0.6 })}`
}

const closeButton = (actionId: number, parentWidth: number, parentHeight: number, options?: { width?: number, height?: number, padding?: number }): string => {
  const width: number = options?.width ?? CONFIG.closeButton.buttonWidth
  const height: number = options?.height ?? CONFIG.closeButton.buttonHeight
  const padding: number = options?.padding ?? CONFIG.closeButton.padding
  return `<quad posn="${parentWidth / 2} ${-parentHeight / 2} 1" sizen="${width} ${height}" halign="center" valign="center" bgcolor="${CONFIG.closeButton.background}"/>
  <quad posn="${parentWidth / 2} ${-parentHeight / 2} 3" sizen="${width - padding * 2} ${height - padding * 2}" halign="center" valign="center" action="${actionId}" 
  imagefocus="${stringToObjectProperty(CONFIG.closeButton.iconHover, ICONS)}"
  image="${stringToObjectProperty(CONFIG.closeButton.icon, ICONS)}"/>`
}

const getCpTypes = (checkpoints: number[][]): ('best' | 'worst' | 'equal' | undefined)[][] => {
  if (checkpoints.length === 0 || checkpoints?.[0]?.length === 0) {
    return []
  }
  const cpAmount: number = checkpoints[0].length
  const cps: number[][] = Array.from(new Array(cpAmount), (): never[] => [])
  for (let i: number = 0; i < checkpoints.length; i++) {
    const cpRow: number[] = checkpoints?.[i]
    if (cpRow === undefined) { break }
    for (let j: number = 0; j < cpAmount; j++) {
      cps[j][i] = cpRow[j]
    }
  }
  const cpTypes: ('best' | 'worst' | 'equal' | undefined)[][] = Array.from(Array(cps[0].length), (): any[] => new Array(cps.length).fill(undefined))
  for (const [i, e] of cps.entries()) {
    if (cps?.[0]?.length < 2) {
      break
    }
    const max: number = Math.max(...e.filter(a => !isNaN(a)))
    const worst: number[] = e.filter(a => a === max)
    const min: number = Math.min(...e.filter(a => !isNaN(a)))
    const best: number[] = e.filter(a => a === min)
    if (max === min) {
      continue
    }
    if (worst.length === 1) {
      cpTypes[e.indexOf(worst[0])][i] = 'worst'
    }
    if (best.length === 1) {
      cpTypes[e.indexOf(best[0])][i] = 'best'
    } else {
      const indexes: number[] = e.reduce((acc: number[], cur, i): number[] => cur === min ? [...acc, i] : acc, [])
      for (const index of indexes) {
        cpTypes[index][i] = 'equal'
      }
    }
  }
  return cpTypes
}

export { Paginator, Grid, Navbar, DropdownMenu, RecordList, CONFIG, ICONS, BACKGROUNDS, IDS, getCpTypes, closeButton, horizontallyCenteredText, constuctButton, stringToObjectProperty, fullScreenListener, staticHeader, gridCell, centeredText, footerCloseButton, headerIconTitleText, calculateStaticPositionY, verticallyCenteredText }