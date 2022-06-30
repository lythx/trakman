import { TRAKMAN as TM } from "../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import { CONFIG, IDS } from './UiUtils.js'
import UTILIDS from './config/UtilIds.json' assert { type: 'json' }
import Navbar from './utils/Navbar.js'

export default abstract class PopupWindow extends DynamicComponent {

  readonly openId: number
  readonly closeId: number
  protected readonly headerIcon: string
  protected readonly title: string
  protected readonly headerLeft: string
  protected readonly headerRight: string
  protected readonly frameMidBottom: string
  protected readonly frameBottom: string
  protected readonly navbar: Navbar
  protected readonly navbarHeight: number
  protected readonly windowWidth: number
  protected readonly windowHeight: number
  protected readonly contentWidth: number
  protected readonly contentHeight: number
  protected readonly headerHeight: number = 4
  protected readonly headerBg: string = CONFIG.popup.headerBg
  protected readonly bg: string = CONFIG.popup.bg
  protected readonly margin: number = CONFIG.popup.margin
  protected readonly footerHeight = 4
  protected readonly headerPageWidth: number = 10

  constructor(windowId: number, headerIcon: string, title: string, navbar: string[], windowHeight: number = 60, windowWidth: number = 90) {
    super(IDS.PopupWindow)
    this.headerIcon = headerIcon
    this.title = title
    this.openId = windowId + UTILIDS.PopupWindow.open
    this.closeId = windowId + UTILIDS.PopupWindow.close
    this.windowHeight = windowHeight
    this.windowWidth = windowWidth;
    const buttons = this.getButtons(navbar)
    this.navbar = new Navbar(buttons, this.windowWidth);
    this.navbarHeight = this.navbar.height
    this.contentWidth = windowWidth
    this.contentHeight = windowHeight - (2 * this.headerHeight + this.navbarHeight + 2 * this.margin);
    [this.headerLeft, this.headerRight, this.frameMidBottom, this.frameBottom] = this.constructFrame()
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo): void => {
      if (info.answer === this.openId) { this.onOpen(info) }
      else if (info.answer === this.closeId) { this.onClose(info) }
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.displayToPlayer(info.login)
  }

  protected onClose(info: ManialinkClickInfo): void {
    this.hideToPlayer(info.login)
  }

  private constructFrame(): string[] {
    let navbarBg: string = ''
    const lgt: number = this.navbar.buttons.length
    for (let i: number = 0; i < lgt; i++) {
      navbarBg += `<quad posn="${((this.windowWidth + this.margin) / lgt) * i} 0 2" sizen="${(this.windowWidth + this.margin) / lgt - this.margin} ${this.navbarHeight}" bgcolor="${this.headerBg}"/>`
    }
    return [
      `<manialink id="${this.id}">
        <frame posn="-${this.windowWidth / 2} ${this.windowHeight / 2} 5">
          <frame posn="0 0 5">
            <quad posn="0 0 2" sizen="${this.headerHeight} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.headerHeight - this.margin * 2} ${this.headerHeight - this.margin * 2}" image="${this.headerIcon}"/>
            <quad posn="${this.headerHeight + this.margin} 0 2" sizen="${this.windowWidth - (this.headerHeight + this.headerPageWidth + this.margin * 2)} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
            <label posn="${this.windowWidth / 2} -${this.headerHeight / 2} 5" sizen="${this.windowWidth} ${this.headerHeight}" scale="1" text="${TM.safeString(this.title)}" valign="center" halign="center"/>
            <frame posn="${this.headerHeight + this.windowWidth - (this.headerHeight + this.headerPageWidth)} 0 4">
              <quad posn="0 0 2" sizen="${this.headerPageWidth} ${this.headerHeight}" bgcolor="${this.headerBg}"/>`,
      `
            </frame>
          </frame>
          <frame posn="0 ${-(this.headerHeight + this.margin)} 5">
            ${navbarBg}
            ${this.navbar.constructXml()}
          </frame>
          <frame posn="0 ${-(this.headerHeight + this.navbarHeight + this.margin * 2)} 5">
            <quad posn="0 0 2" sizen="${this.windowWidth} ${this.windowHeight - (this.headerHeight * 2 + this.margin * 2 + this.navbarHeight)}" bgcolor="${this.bg}"/>
            <frame posn="0 0 1">`,
      `
          </frame>
        </frame>
          <frame posn="0 -${this.windowHeight - (this.footerHeight - this.margin)} 5">
            <quad posn="0 0 2" sizen="${this.windowWidth} ${this.footerHeight}" bgcolor="${this.headerBg}"/>`,
      `
          </frame>
        </frame>
      </manialink>`
    ]
  }

  private getButtons(names: string[]): { name: string, action: number }[] {
    const ret: { name: string, action: number }[] = []
    for (const e of names) {
      const name = (CONFIG as any)?.[e]?.title ?? e
      const action = (IDS as any)?.[e] ?? ''
      ret.push({ name, action })
    }
    return ret
  }

  protected abstract constructContent(login: string, params: any): string

  protected abstract constructFooter(login: string, params: any): string

  displayToPlayer(login: string, params?: any, topRightText?: string): void {
    const content: string = this.constructContent(login, params)
    const footer: string = this.constructFooter(login, params)
    TM.sendManialink(`${this.headerLeft}
    <label posn="${this.headerPageWidth / 2} ${-(this.headerHeight - this.margin) / 2} 3" sizen="${this.headerPageWidth} ${this.headerHeight - this.margin}" scale="1" text="${topRightText ?? ''}" valign="center" halign="center"/>
    ${this.headerRight}
    ${content}
    ${this.frameMidBottom}
    ${footer}
    ${this.frameBottom}`, login)
  }

}