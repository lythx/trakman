import { horizontallyCenteredText } from './TextUtils.js'
import CONFIG from '../config/UIConfig.json' assert { type: 'json' }

export interface ButtonOptions {
    icon: string,
    text1: string,
    text2: string,
    iconWidth: number,
    iconHeight: number,
    padding: number,
    equalTexts?: boolean,
    actionId?: number,
    link?: string
}

export default (options: ButtonOptions): string => {
    const t1: string = options?.equalTexts ?
        horizontallyCenteredText(options.text1, width, height, { yOffset: 2.4, textScale: 0.36, padding: 0.6 }) :
        horizontallyCenteredText(options.text1, width, height, { yOffset: 2.2, textScale: 0.5, padding: 0.6 })
    const actionId: string = options?.actionId === undefined ? '' : `action="${options.actionId}"`
    const link: string = options?.link === undefined ? '' : `url="${options.link}"`
    return `<quad posn="0 0 1" sizen="${width} ${height}" bgcolor="${CONFIG.staticHeader.bgColor}" ${actionId} ${link}/>
    <quad posn="${(width - iconWidth) / 2} ${-topPadding} 5" sizen="${iconWidth} ${iconHeight}" image="${iconUrl}"/>
    ${t1}
    ${horizontallyCenteredText(text2, width, height, { yOffset: 3.65, textScale: 0.36, padding: 0.6 })}`
}

