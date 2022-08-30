import { trakman as tm } from '../../../src/Trakman.js'
import config from './Navbar.config.js'

export default class Navbar {

  readonly width: number
  readonly height: number
  buttons: { name: string, actionId: number }[]
  buttonWidth: number
  readonly hoverImage: string
  readonly bg: string

  constructor(buttons: { name: string, actionId: number }[], width: number, height: number | null = config.height,
     background: string = config.background, hoverImgUrl: string = config.hoverImage) {
    this.width = width
    this.height = height ?? config.height
    this.buttons = buttons
    this.buttonWidth = this.width / buttons.length
    this.hoverImage = hoverImgUrl
    this.bg = background
  }

  setButtons(buttons: { name: string, actionId: number }[]) {
    this.buttons = buttons
    this.buttonWidth = this.width / buttons.length
  }

  constructXml(): string {
    let xml: string = ``
    const w = (this.width + config.margin) / this.buttons.length
    for (const [i, e] of this.buttons.entries()) {
      xml += `<frame posn="${w * i} 0 1">
            <quad posn="0 0 3" sizen="${w - config.margin} ${this.height}" image="f" imagefocus="${this.hoverImage}" action="${e.actionId}"/>
            <quad posn="0 0 2" sizen="${w - config.margin} ${this.height}" bgcolor="${this.bg}"/>
            <label posn="${w / 2} -${(this.height / 2)} 9" sizen="${(w * (1 / config.textScale)) - (config.padding * 2)} ${this.height}" scale="${config.textScale}" text="${tm.utils.safeString(e.name)}" valign="center" halign="center"/>
            </frame>`
    }
    return xml
  }

}