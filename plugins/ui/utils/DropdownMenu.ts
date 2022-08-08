import { trakman as TM } from '../../../src/Trakman.js'
import ICN from '../config/Icons.json' assert { type: 'json' }
import BG from '../config/Backgrounds.json' assert { type: 'json' }

//TODO THIS IN CONFIG FILE
const DEFAULT_OPTION_HEIGHT: number = 2
const DEFAULT_PADDING: number = 1
const DEFAULT_TEXT_SCALE: number = 1
const DEFAULT_BACKGROUND_IMAGE: string = ICN.clock
const DEFAULT_HOVER_IMAGE: string = BG.darkblue

export default class DropdownMenu {

  readonly id: number
  readonly width: number
  readonly options: { name: string, action: number }[]
  readonly defaultText: string
  readonly optionHeight: number
  readonly textPadding: number
  readonly textScale: number
  readonly backgroundImage: string
  readonly hoverImage: string

  constructor(parentId: number, width: number, options: { name: string, action: number }[], defaultText?: string | null,
    optionalParams?: { optionHeight?: number, textPadding?: number, textScale?: number, backgroundImage: string, hoverImage: string }) {
    this.id = parentId
    this.width = width
    this.options = options
    this.defaultText = defaultText ?? options.length !== 0 ? options[0].name : ''
    this.optionHeight = optionalParams?.optionHeight ?? DEFAULT_OPTION_HEIGHT
    this.textPadding = optionalParams?.textPadding ?? DEFAULT_PADDING
    this.textScale = optionalParams?.textScale ?? DEFAULT_TEXT_SCALE
    this.backgroundImage = optionalParams?.backgroundImage ?? DEFAULT_BACKGROUND_IMAGE
    this.hoverImage = optionalParams?.hoverImage ?? DEFAULT_HOVER_IMAGE
  }

  constructXml(): string {
    let xml: string = ''
    for (const [i, e] of this.options.entries()) {
      xml += `<frame posn="0 0 9">
            <quad posn="0 ${this.optionHeight * i} 1" sizen="${this.width} ${this.optionHeight}" image="${this.backgroundImage}" imagefocus="${this.hoverImage}" action="${e.action}"/>
            <label posn="${this.width / 2} -${this.optionHeight / 2} 2" sizen="${(this.width * (1 / this.textScale)) - (this.textPadding * 2)} ${this.optionHeight}" scale="${this.textScale}" text="${TM.utils.safeString(e.name)}" valign="center" halign="center"/>
            </frame>`
    }
    return xml
  }

}