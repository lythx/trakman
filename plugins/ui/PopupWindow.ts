import { TRAKMAN as TM } from "../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import { BACKGROUNDS as BG, CONFIG, IDS } from './UiUtils.js'
import UTILIDS from './config/UtilIds.json' assert { type: 'json' }
import Navbar from './utils/Navbar.js'

export default abstract class PopupWindow extends DynamicComponent {

  readonly openId: number
  readonly closeId: number
  private readonly headerIcon: string
  private readonly title: string
  private readonly header: string
  private readonly frameMidBottom: string
  private readonly frameBottom: string
  private readonly navbar: Navbar
  protected readonly navbarHeight: number
  protected readonly windowWidth: number
  protected readonly windowHeight: number
  protected readonly contentWidth: number
  protected readonly contentHeight: number
  protected readonly headerHeight: number = 4
  protected readonly headerBg: string = CONFIG.popup.headerBg
  protected readonly bg: string = CONFIG.popup.bg
  protected readonly margin = CONFIG.popup.margin
  protected readonly headerPageWidth = 10

  constructor(windowId: number, headerIcon: string, title: string, navbar: { action: number, name: string }[], windowHeight: number = 60, windowWidth: number = 90) {
    super(IDS.PopupWindow)
    this.headerIcon = headerIcon
    this.title = title
    this.openId = windowId + UTILIDS.PopupWindow.open
    this.closeId = windowId + UTILIDS.PopupWindow.close
    this.windowHeight = windowHeight
    this.windowWidth = windowWidth;
    this.navbar = new Navbar(navbar, this.windowWidth);
    this.navbarHeight = this.navbar.height + this.margin
    this.contentWidth = windowWidth
    this.contentHeight = windowHeight - (2 * this.headerHeight + this.navbarHeight);
    [this.header, this.frameMidBottom, this.frameBottom] = this.constructFrame()
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
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
    let navbarBg = ''
    const lgt = this.navbar.buttons.length
    for (let i = 0; i < lgt; i++) {
      navbarBg += `<quad posn="${((this.windowWidth + this.margin) / lgt) * i} 0 2" sizen="${(this.windowWidth + this.margin) / lgt - this.margin} ${this.navbarHeight - this.margin}" bgcolor="${this.headerBg}"/>`
    }
    return [
      `<manialink id="${this.id}">
        <frame posn="-${this.windowWidth / 2} ${this.windowHeight / 2} 5">
          <frame posn="0 0 5">
            <quad posn="0 0 2" sizen="${this.headerHeight - this.margin} ${this.headerHeight - this.margin}" bgcolor="${this.headerBg}"/>
            <quad posn="0 0 4" sizen="${this.headerHeight - this.margin} ${this.headerHeight - this.margin}" image="${this.headerIcon}"/>
            <quad posn="${this.headerHeight} 0 2" sizen="${this.windowWidth - (this.headerHeight + this.headerPageWidth + this.margin)} ${this.headerHeight - this.margin}" bgcolor="${this.headerBg}"/>
            <label posn="${this.windowWidth / 2} -${this.headerHeight / 2} 5" sizen="${this.windowWidth} ${this.headerHeight}" scale="1" text="${TM.safeString(this.title)}" valign="center" halign="center"/>
            <quad posn="${this.headerHeight + this.windowWidth - (this.headerHeight + this.headerPageWidth)} 0 2" sizen="${this.headerPageWidth} ${this.headerHeight - this.margin}" bgcolor="${this.headerBg}"/>
          </frame>
          <frame posn="0 ${-this.headerHeight} 5">
            ${navbarBg}
            ${this.navbar.constructXml()}
          </frame>
          <frame posn="0 ${-(this.headerHeight + this.navbarHeight)} 5">
            <quad posn="0 0 2" sizen="${this.windowWidth} ${this.windowHeight - (this.headerHeight * 2 + this.margin +this.navbarHeight)}" bgcolor="${this.bg}"/>
            <frame posn="0 0 1">`,
      `
          </frame>
        </frame>
          <frame posn="0 -${this.windowHeight - this.headerHeight} 5">
            <quad posn="0 0 2" sizen="${this.windowWidth} ${this.headerHeight - this.margin}" bgcolor="${this.headerBg}"/>`,
      `
          </frame>
        </frame>
      </manialink>`
    ]
  }

  protected abstract constructContent(login: string, params: any): string

  protected abstract constructFooter(login: string, params: any): string

  displayToPlayer(login: string, params?: any): void {
    const content = this.constructContent(login, params)
    const footer = this.constructFooter(login, params)
    TM.sendManialink(`${this.header}${content}${this.frameMidBottom}${footer}${this.frameBottom}`, login)
  }

}