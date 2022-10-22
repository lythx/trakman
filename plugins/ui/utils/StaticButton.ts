import { horizontallyCenteredText } from './TextUtils.js'
import config from './StaticButton.config.js'

/**
 * Constructs button manialink used in static UI
 * @param iconUrl Button image url
 * @param text1 Top text
 * @param text2 Bottom text
 * @param width Button width
 * @param height Button height
 * @param iconWidth Button image width
 * @param iconHeight Button image height
 * @param topPadding Gap between icon and top border // TODO maybe optionals
 * @param options Optional parameters
 * @returns Button XML string
 */
export default function (iconUrl: string, text1: string, text2: string, width: number, height: number, iconWidth: number,
  iconHeight: number, topPadding: number, options?: { equalTexts?: true, actionId?: number, link?: string }): string {
  const t1: string = options?.equalTexts ?
    horizontallyCenteredText(text1, width, height, { yOffset: config.yOffset, textScale: config.textScale, padding: config.padding }) :
    horizontallyCenteredText(text1, width, height, { yOffset: config.yOffsetBig, textScale: config.textScaleBig, padding: config.padding })
  const actionId: string = options?.actionId === undefined ? '' : `action="${options.actionId}"`
  const link: string = options?.link === undefined ? '' : `url="${options.link}"`
  return `<quad posn="0 0 1" sizen="${width} ${height}" bgcolor="${config.background}" ${actionId} ${link}/>
  <quad posn="${(width - iconWidth) / 2} ${-topPadding} 5" sizen="${iconWidth} ${iconHeight}" image="${iconUrl}"/>
  ${t1}
  ${horizontallyCenteredText(text2, width, height, { yOffset: config.yOffsetBottom, textScale: config.textScale, padding: config.padding })}`
}