import { TRAKMAN as TM } from '../../../src/Trakman.js'
import BGS from '../config/Backgrounds.json' assert { type: 'json' }
import ICN from '../config/Icons.json' assert { type: 'json' }

//TODO THIS IN CONFIG FILE
const DEFAULT_HEIGHT = 3

export default class Navbar {

  readonly width: number
  readonly height: number
  readonly buttons: { name: string, action: number }[]
  readonly buttonWidth: number
  //TODO THIS IN CONFIG FILE
  readonly textScale = 0.75
  //AND THIS
  readonly padding = 1
  readonly hoverImage: string

  constructor(buttons: { name: string, action: number }[], width: number, height: number | null = DEFAULT_HEIGHT, hoverImgUrl: string = BGS.black40) {
    this.width = width
    this.height = height ?? DEFAULT_HEIGHT
    this.buttons = [...buttons]
    this.buttonWidth = this.width / buttons.length
    this.hoverImage = hoverImgUrl
  }

  constructXml(): string {
    let xml = ``
    for (const [i, e] of this.buttons.entries()) {
      xml += `<frame posn="${this.buttonWidth * i} 0 1">
            <quad posn="0 0 1" sizen="${this.buttonWidth} ${this.height}" image="${ICN.blank}" imagefocus="${this.hoverImage}" action="${e.action}"/>
            <label posn="${this.buttonWidth / 2} -${this.height / 2} 9" sizen="${(this.buttonWidth * (1 / this.textScale)) - (this.padding * 2)} ${this.height}" scale="${this.textScale}" text="${TM.safeString(e.name)}" valign="center" halign="center"/>
            </frame>`
    }
    return xml
  }

}