import { verticallyCenteredText, centeredText, rightAlignedText } from './TextUtils.js'
import raceConfig from '../config/RaceHeader.js'
import resultConfig from '../config/ResultHeader.js'

interface StaticHeaderOptions {
  height: number, iconWidth: number, iconHeight: number, actionId?: number
  textScale: number, rectangleWidth: number, horizontalPadding: number, verticalPadding: number,
  iconVerticalPadding: number, iconHorizontalPadding: number, centerText: boolean,
  iconBackground: string, textBackground: string,
  squareWidth: number, margin: number
}

export default class StaticHeader {

  options: StaticHeaderOptions 

  constructor(preset: 'race' | 'result', defaultOptions: Partial<StaticHeaderOptions> = {}) {
    if(preset === 'result') {
      this.options = resultConfig
    } else {
      this.options = raceConfig
    }
    for (const [k, v] of Object.entries(defaultOptions)) {
      (this.options as any)[k] = v
    }
  }

  constructXml(text: string, icon: string, side: boolean, options: Partial<StaticHeaderOptions> = {}): string {
    const cfg = { ...this.options }
    for (const [k, v] of Object.entries(options)) {
      (cfg as any)[k] = v
    }
    if (side === true) {
      let label: string = ''
      if (cfg.centerText) {
        label = centeredText(text, cfg.rectangleWidth, cfg.height,
          { textScale: cfg.textScale, padding: cfg.horizontalPadding, xOffset: cfg.squareWidth + cfg.margin })
      } else {
        label = verticallyCenteredText(text, cfg.rectangleWidth, cfg.height,
          { textScale: cfg.textScale, padding: cfg.horizontalPadding, xOffset: cfg.squareWidth + cfg.margin })
      }
      return `<quad posn="0 0 5" sizen="${cfg.squareWidth + cfg.rectangleWidth + cfg.margin} ${cfg.height}" action="${cfg.actionId}"/>
          <quad posn="0 0 1" sizen="${cfg.squareWidth} ${cfg.height}" bgcolor="${cfg.iconBackground}"/>
          <quad posn="${cfg.iconHorizontalPadding} -${cfg.iconVerticalPadding} 2"
           sizen="${cfg.iconWidth} ${cfg.iconHeight}" image="${icon}"/>
          <quad posn="${cfg.squareWidth + cfg.margin} 0 1" sizen="${cfg.rectangleWidth} ${cfg.height}" bgcolor="${cfg.textBackground}"/>
          ${label}
         `
    } else {
      let label: string = ''
      if (cfg.centerText) {
        label = centeredText(text, cfg.rectangleWidth, cfg.height, { textScale: cfg.textScale, padding: cfg.horizontalPadding })
      } else {
        label = rightAlignedText(text, cfg.rectangleWidth, cfg.height, { textScale: cfg.textScale, yOffset: -0.1 }) // TODO FIX RIGHT ALIGNED TEXT
      }
      return `<quad posn="0 0 5" sizen="${cfg.squareWidth + cfg.rectangleWidth + cfg.margin} ${cfg.height}" action="${cfg.actionId}"/>
          <quad posn="0 0 1" sizen="${cfg.rectangleWidth} ${cfg.height}" bgcolor="${cfg.textBackground}"/>
          ${label}
          <quad posn="${cfg.rectangleWidth + cfg.margin} 0 1" sizen="${cfg.squareWidth} ${cfg.height}" bgcolor="${cfg.iconBackground}"/>
          <quad posn="${cfg.rectangleWidth + cfg.margin + (cfg.iconHorizontalPadding)} -${cfg.iconVerticalPadding} 2"
           sizen="${cfg.iconWidth} ${cfg.iconHeight}" image="${icon}"/>
         `
    }
  }

}
