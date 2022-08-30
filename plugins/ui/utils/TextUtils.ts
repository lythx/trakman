import config from './TextUtils.config.js'

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

const verticallyCenteredText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = options?.xOffset ?? 0
  const posY: number = parentHeight / 2 + (options?.yOffset ?? config.yOffset)
  return `<label posn="${padding + posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" 
  scale="${textScale}" text="${config.format}${text}" valign="center"/>`
}

const horizontallyCenteredText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = parentWidth / 2 + (options?.xOffset ?? 0)
  const posY: number = options?.yOffset ?? 0
  return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" 
  scale="${textScale}" text="${config.format}${text}" halign="center"/>`
}

const rightAlignedText = (text: string, parentWidth: number, parentHeight: number,
  options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
  const textScale: number = options?.textScale ?? config.textScale
  const padding: number = options?.padding ?? config.padding
  const posX: number = parentWidth + (options?.xOffset ?? 0)
  const posY: number = parentHeight / 2 + (options?.yOffset ?? config.yOffset)
  return `<label posn="${posX - padding} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}"
   scale="${textScale}" text="${config.format}${text}" valign="center" halign="right"/>`
}

export { centeredText, verticallyCenteredText, horizontallyCenteredText, rightAlignedText }