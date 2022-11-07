import { leftAlignedText, centeredText, rightAlignedText } from './TextUtils.js'
import raceConfig from './StaticHeaderRace.config.js'
import resultConfig from './StaticHeaderResult.config.js'

export interface StaticHeaderOptions {
  /** Header height */
  height: number,
  /** Image width */
  iconWidth: number,
  /** Image height */
  iconHeight: number,
  /** Click action ID */
  actionId?: number
  /** Header text scale */
  textScale: number,
  /** Width of the rectangle containing text */
  rectangleWidth: number,
  /** Text horizontal padding */
  horizontalPadding: number,
  /** Text vertical padding */
  verticalPadding: number,
  /** Image vertical padding */
  iconVerticalPadding: number,
  /** Image horizontal padding */
  iconHorizontalPadding: number,
  /** If true the text will be centered */
  centerText: boolean,
  /** Image background */
  iconBackground: string,
  /** Header text background */
  textBackground: string,
  /** Width of the square containing the image */
  squareWidth: number,
  /** Margin between the square and the rectangle */
  margin: number
}

/**
 * Util to display manialink headers in static UI.
 */
export default class StaticHeader {

  /** Header options */
  options: StaticHeaderOptions
  /** Default height in race preset */
  static raceHeight: number = raceConfig.height
  /** Defualt height in result preset */
  static resultHeight: number = resultConfig.height
  /** Race preset options */
  static racePreset = raceConfig
  /** Result preset options */
  static resultPreset = resultConfig

  /**
   * Util to display manialink headers in static UI
   * @param preset Default preset options to use
   * @param options Optional parameters. Parameters in this object override preset parameters 
   */
  constructor(preset: 'race' | 'result' = 'race', options: Partial<StaticHeaderOptions> = {}) {
    if (preset === 'result') {
      this.options = { ...resultConfig }
    } else {
      this.options = { ...raceConfig }
    }
    for (const [k, v] of Object.entries(options)) {
      (this.options as any)[k] = v
    }
  }

  /**
   * Constructs header manialink used in static UI
   * @param text Header text
   * @param icon Header icon
   * @param side Header side. Text and icon are displayed in different order depending on side (true is right)
   * @param options Optional parameters. Parameters in this object override parameters in preset and constructor
   * @returns Header XML string
   */
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
        label = leftAlignedText(text, cfg.rectangleWidth, cfg.height,
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
        label = rightAlignedText(text, cfg.rectangleWidth, cfg.height, { textScale: cfg.textScale })
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
