import { centeredText } from '../UI.js'
import config from './Navbar.config.js'

/**
 * Util to display horizontal navbar, used by popup windows.
 */
export default class Navbar {

  /** Navbar width */
  readonly width: number
  /** Navbar height */
  readonly height: number
  private buttons: { name: string, actionId: number, privilege: number }[]
  /** Background image displayed on button hover */
  readonly hoverImage: string
  /** Background colour */
  readonly background: string

  /**
   * Util to display horizontal navbar, used by popup windows
   * @param buttons Array of button objects
   * @param width Navbar width
   * @param height Navbar height
   * @param background Navbar background
   * @param hoverImgUrl Background image to display on button hover
   */
  constructor(buttons: {
    name: string, actionId: number,
    privilege?: number
  }[], width: number, height: number | null = config.height,
    background: string = config.background, hoverImgUrl: string = config.hoverImage) {
    this.width = width
    this.height = height ?? config.height
    this.buttons = buttons.map(a => ({ ...a, privilege: a.privilege ?? 0 }))
    this.hoverImage = hoverImgUrl
    this.background = background
  }

  /**
   * Gets button count for given privilege
   * @param privilege Privilege (0 by default)
   * @returns Button count
   */
  getButtonCount(privilege: number = 0): number {
    return this.buttons.filter(a => a.privilege <= privilege).length
  }

  /**
   * Creates navbar XML string for given privilege
   * @param privilege Privilege (0 by default)
   * @returns Navbar XML string
   */
  constructXml(privilege: number = 0): string {
    let xml: string = ``
    const arr = this.buttons.filter(a => a.privilege <= privilege)
    const w: number = (this.width + config.margin) / arr.length
    for (const [i, e] of arr.entries()) {
      xml += `<frame posn="${w * i} 0 1">
            <quad posn="0 0 3" sizen="${w - config.margin} ${this.height}" image="f" imagefocus="${this.hoverImage}" action="${e.actionId}"/>
            <quad posn="0 0 2" sizen="${w - config.margin} ${this.height}" bgcolor="${this.background}"/>
            ${centeredText(tm.utils.safeString(e.name), w, this.height)}
            </frame>`
    }
    return xml
  }

}
