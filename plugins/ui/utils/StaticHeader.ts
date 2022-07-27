import { verticallyCenteredText, centeredText, rightAlignedText } from './TextUtils.js'
import CONFIG from '../config/UIConfig.json' assert { type: 'json' }

export const staticHeader = (text: string, icon: string, side: boolean,
  options?: {
    iconWidth?: number, iconHeight?: number, actionId?: number
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
      label = centeredText(text, rectWidth, CFG.height, { textScale, padding: horizontalPadding, xOffset: CFG.squareWidth + CONFIG.marginSmall })
    } else if (options?.centerVertically) {
      label = verticallyCenteredText(text, rectWidth, CFG.height, { textScale, padding: horizontalPadding, xOffset: CFG.squareWidth + CONFIG.marginSmall })
    } else {
      label = `<label posn="${CFG.squareWidth + horizontalPadding} -${options?.verticalPadding ?? CFG.verticalPadding} 2" 
          sizen="${(CFG.rectangleWidth * (1 / textScale)) - (horizontalPadding * 2)} 2" scale="${textScale}" text="${text}"/>`
    }
    return `<quad posn="0 0 5" sizen="${CFG.squareWidth + rectWidth + CFG.margin} ${CFG.height}" action="${options?.actionId}"/>
        <quad posn="0 0 1" sizen="${CFG.squareWidth} ${CFG.height}" bgcolor="${options?.iconBackground ?? CFG.iconBgColor}"/>
        <quad posn="${options?.iconHorizontalPadding ?? CFG.iconHorizontalPadding} -${options?.iconVerticalPadding ?? CFG.iconVerticalPadding} 2"
         sizen="${options?.iconWidth ?? CFG.iconWidth} ${options?.iconHeight ?? CFG.iconHeight}" image="${icon}"/>
        <quad posn="${CFG.squareWidth + CFG.margin} 0 1" sizen="${rectWidth} ${CFG.height}" bgcolor="${options?.textBackgrund ?? CFG.bgColor}"/>
        ${label}
       `
  } else {
    let label: string = ''
    if (options?.centerText) {
      label = centeredText(text, rectWidth, CFG.height, { textScale, padding: horizontalPadding })
    } else if (options?.centerVertically) {
      label = verticallyCenteredText(text, rectWidth, CFG.height, { textScale, padding: horizontalPadding })
    } else {
      label = rightAlignedText(text, CFG.rectangleWidth, CFG.height, { textScale, yOffset: -0.1 })
    }
    return `<quad posn="0 0 5" sizen="${CFG.squareWidth + rectWidth + CFG.margin} ${CFG.height}" action="${options?.actionId}"/>
        <quad posn="0 0 1" sizen="${rectWidth} ${CFG.height}" bgcolor="${options?.textBackgrund ?? CFG.bgColor}"/>
        ${label}
        <quad posn="${rectWidth + CFG.margin} 0 1" sizen="${CFG.squareWidth} ${CFG.height}" bgcolor="${options?.iconBackground ?? CFG.iconBgColor}"/>
        <quad posn="${rectWidth + CFG.margin + (options?.iconHorizontalPadding ?? CFG.iconHorizontalPadding)} -${options?.iconVerticalPadding ?? CFG.iconVerticalPadding} 2"
         sizen="${options?.iconWidth ?? CFG.iconWidth} ${options?.iconHeight ?? CFG.iconHeight}" image="${icon}"/>
       `
  }
}
