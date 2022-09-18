import { trakman as tm } from '../../../src/Trakman.js'
import config from './Navbar.config.js'

export default class Navbar {

  readonly width: number
  readonly height: number
  private buttons: { name: string, actionId: number, privilege: number }[]
  readonly hoverImage: string
  readonly bg: string

  constructor(buttons: { name: string, actionId: number, privilege?: number }[], width: number, height: number | null = config.height,
    background: string = config.background, hoverImgUrl: string = config.hoverImage) {
    this.width = width
    this.height = height ?? config.height
    this.buttons = buttons.map(a => ({ ...a, privilege: a.privilege ?? 0 }))
    this.hoverImage = hoverImgUrl
    this.bg = background
  }

  getButtonCount(privilege: number = 0): number {
    return this.buttons.filter(a => a.privilege <= privilege).length
  }

  constructXml(privilege: number = 0): string {
    let xml: string = ``
    const arr = this.buttons.filter(a => a.privilege <= privilege)
    const w = (this.width + config.margin) / arr.length
    for (const [i, e] of arr.entries()) {
      xml += `<frame posn="${w * i} 0 1">
            <quad posn="0 0 3" sizen="${w - config.margin} ${this.height}" image="f" imagefocus="${this.hoverImage}" action="${e.actionId}"/>
            <quad posn="0 0 2" sizen="${w - config.margin} ${this.height}" bgcolor="${this.bg}"/>
            <label posn="${w / 2} -${(this.height / 2)} 9" sizen="${(w * (1 / config.textScale)) - (config.padding * 2)} ${this.height}" scale="${config.textScale}" text="${tm.utils.safeString(e.name)}" valign="center" halign="center"/>
            </frame>`
    }
    return xml
  }

}