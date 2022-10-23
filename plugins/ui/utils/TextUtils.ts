import config from './TextUtils.config.js'

/**
 * Constructs manialink with centered text
 * @param text Text to display
 * @param parentWidth Parent element width
 * @param parentHeight Parent element height
 * @param options Optional parameters
 * @returns Text XML string
 */
const centeredText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number, specialFont?: true }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = parentWidth / 2 + (options?.xOffset ?? 0)
  const posY: number = parentHeight / 2 + (options?.yOffset ?? config.yOffset)
  const styleStr = options?.specialFont ? `style="TextRaceChrono"` : ''
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}"
   scale="${textScale}" text="${config.format}${text}" ${styleStr} valign="center" halign="center"/>`
}

/**
 * Constructs manialink with left aligned and vertically centered text
 * @param text Text to display
 * @param parentWidth Parent element width
 * @param parentHeight Parent element height
 * @param options Optional parameters
 * @returns Text XML string
 */
const leftAlignedText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = options?.xOffset ?? 0
  const posY: number = parentHeight / 2 + (options?.yOffset ?? config.yOffset)
  return `<label posn="${padding + posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" 
  scale="${textScale}" text="${config.format}${text}" valign="center"/>`
}

/**
 * Constructs manialink with horizontally centered text
 * @param text Text to display
 * @param parentWidth Parent element width
 * @param parentHeight Parent element height
 * @param options Optional parameters
 * @returns Text XML string
 */
const horizontallyCenteredText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = parentWidth / 2 + (options?.xOffset ?? 0)
  const posY: number = options?.yOffset ?? 0
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" 
  scale="${textScale}" text="${config.format}${text}" halign="center"/>`
}

/**
 * Constructs manialink with right aligned and vertically centered text
 * @param text Text to display
 * @param parentWidth Parent element width
 * @param parentHeight Parent element height
 * @param options Optional parameters
 * @returns Text XML string
 */
const rightAlignedText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = parentWidth + (options?.xOffset ?? 0)
  const posY: number = parentHeight / 2 + (options?.yOffset ?? config.yOffset)
  return `<label posn="${posX - padding} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}"
   scale="${textScale}" text="${config.format}${text}" valign="center" halign="right"/>`
}

export { centeredText, leftAlignedText, horizontallyCenteredText, rightAlignedText }