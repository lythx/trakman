import { trakman as tm } from '../../../src/Trakman.js'
import BGS from '../config/Backgrounds.json' assert { type: 'json' }
import { CONFIG } from '../UiUtils.js'

//TODO THIS IN CONFIG FILE
const DEFAULT_HEIGHT: number = 3.5

export default class Navbar {

  readonly width: number
  readonly height: number
  buttons: { name: string, action: number }[]
  buttonWidth: number
  //TODO THIS IN CONFIG FILE
  readonly textScale: number = 0.75
  //AND THIS
  readonly padding: number = 1
  readonly hoverImage: string
  readonly margin: number = 0.15
  readonly bg: string

  constructor(buttons: { name: string, action: number }[], width: number, height: number | null = DEFAULT_HEIGHT, background: string = CONFIG.popup.headerBg, hoverImgUrl: string = BGS.black40) {
    this.width = width
    this.height = height ?? DEFAULT_HEIGHT
    this.buttons = buttons
    this.buttonWidth = this.width / buttons.length
    this.hoverImage = hoverImgUrl
    this.bg = background
  }

  setButtons(buttons: { name: string, action: number }[]) {
    this.buttons = buttons
    this.buttonWidth = this.width / buttons.length
  }

  constructXml(): string {
    let xml: string = ``
    const w = (this.width + this.margin) / this.buttons.length
    for (const [i, e] of this.buttons.entries()) {
      xml += `<frame posn="${w * i} 0 1">
            <quad posn="0 0 3" sizen="${w - this.margin} ${this.height}" image="f" imagefocus="${this.hoverImage}" action="${e.action}"/>
            <quad posn="0 0 2" sizen="${w - this.margin} ${this.height}" bgcolor="${this.bg}"/>
            <label posn="${w / 2} -${(this.height / 2)} 9" sizen="${(w * (1 / this.textScale)) - (this.padding * 2)} ${this.height}" scale="${this.textScale}" text="${tm.utils.safeString(e.name)}" valign="center" halign="center"/>
            </frame>`
    }
    return xml
  }

}