
import DynamicComponent from "./DynamicComponent.js";
import { IDS } from './UiUtils.js'
import UTILIDS from './config/UtilIds.js'
import Navbar from './utils/Navbar.js'
import config from './config/PopupWindow.js'

export default abstract class PopupWindow<DisplayParams = any> extends DynamicComponent {

  readonly openId: number
  readonly closeId: number
  protected readonly headerIcon: string
  protected readonly title: string
  private readonly headerLeft: string
  private readonly headerRight: string
  private readonly frameMidTop: string
  private readonly frameMidBottom: string
  private readonly frameBottom: string
  private readonly noNavbarMidTop: string
  private readonly noNavbarBottom: string
  protected readonly navbar: Navbar
  protected readonly navbarHeight: number
  protected readonly windowWidth: number
  protected readonly windowHeight: number
  protected readonly contentWidth: number
  protected readonly contentHeight: number
  protected readonly headerHeight: number = 4
  protected readonly headerBg: string = config.headerBg
  protected readonly bg: string = config.bg
  protected readonly margin: number = config.margin
  protected readonly footerHeight = 4
  protected readonly headerPageWidth: number = 10
  protected static readonly playersWithWindowOpen: { login: string, id: number, params: any }[] = []

  constructor(windowId: number, headerIcon: string, title: string,
    navbar: { name: string, actionId: number, privilege?: number }[] = [],
    windowHeight: number = 60, windowWidth: number = 90) {
    super(IDS.PopupWindow)
    this.headerIcon = headerIcon
    this.title = title
    this.openId = windowId + UTILIDS.PopupWindow.open
    this.closeId = windowId + UTILIDS.PopupWindow.close
    this.windowHeight = windowHeight
    this.windowWidth = windowWidth;
    this.navbar = new Navbar(navbar, this.windowWidth);
    this.navbarHeight = this.navbar.height
    this.contentWidth = windowWidth
    this.contentHeight = windowHeight - (2 * this.headerHeight + this.navbarHeight + 2 * this.margin);
    [this.headerLeft, this.headerRight, this.frameMidTop,
    this.frameMidBottom, this.frameBottom, this.noNavbarMidTop, this.noNavbarBottom] = this.constructFrame()
    tm.addListener('ManialinkClick', (info: ManialinkClickInfo): void => {
      if (info.actionId === this.openId) { this.onOpen(info) }
      else if (info.actionId === this.closeId) { this.onClose(info) }
    })
    tm.addListener('PlayerLeave', (info: LeaveInfo) => {
      const index = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === info.login)
      if (index !== -1) {
        PopupWindow.playersWithWindowOpen.splice(index, 1)
      }
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.displayToPlayer(info.login, undefined, undefined, info.privilege)
  }

  protected onClose(info: ManialinkClickInfo): void {
    const index = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === info.login)
    if (index !== -1) {
      PopupWindow.playersWithWindowOpen.splice(index, 1)
    }
    this.hideToPlayer(info.login)
  }

  private constructFrame(): string[] {
    return [
      `<manialink id="${this.id}">
        <frame posn="-${this.windowWidth / 2} ${this.windowHeight / 2} 5">
          <frame posn="0 0 5">
            <quad posn="0 0 2" sizen="${this.headerHeight} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.headerHeight - this.margin * 2} ${this.headerHeight - this.margin * 2}" image="${this.headerIcon}"/>
            <quad posn="${this.headerHeight + this.margin} 0 2" sizen="${this.windowWidth - (this.headerHeight + this.headerPageWidth + this.margin * 2)} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
            <label posn="${this.windowWidth / 2} -${this.headerHeight / 2} 5" sizen="${this.windowWidth} ${this.headerHeight}" scale="1" text="${tm.utils.safeString(this.title)}" valign="center" halign="center"/>
            <frame posn="${this.headerHeight + this.windowWidth - (this.headerHeight + this.headerPageWidth)} 0 4">
              <quad posn="0 0 2" sizen="${this.headerPageWidth} ${this.headerHeight}" bgcolor="${this.headerBg}"/>`,
      `
            </frame>
          </frame>
          <frame posn="0 ${-(this.headerHeight + this.margin)} 5">`,
      `</frame>
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
      </manialink>`,
      `</frame>
      <frame posn="0 ${this.navbarHeight + this.margin} 1">
        <frame posn="0 ${-(this.headerHeight + this.navbarHeight + this.margin * 2)} 5">
          <quad posn="0 0 2" sizen="${this.windowWidth} ${this.windowHeight - (this.headerHeight * 2 + this.margin * 2 + this.navbarHeight)}" bgcolor="${this.bg}"/>
          <frame posn="0 0 1">`,
      `     </frame>
          </frame>
        </frame>
      </manialink>`
    ]
  }

  protected constructNavbar(login: string, params?: DisplayParams, privilege?: number): string {
    return this.navbar.constructXml(privilege)
  }

  protected abstract constructContent(login: string, params?: DisplayParams): string | Promise<string>

  protected abstract constructFooter(login: string, params?: DisplayParams): string

  async displayToPlayer(login: string, params?: DisplayParams, topRightText?: string, privilege?: number): Promise<void> {
    const content: string = await this.constructContent(login, params)
    const footer: string = this.constructFooter(login, params)
    const index = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === login)
    if (index !== -1) {
      PopupWindow.playersWithWindowOpen.splice(index, 1)
    }
    const noNavbar = this.navbar.getButtonCount(privilege) === 0
    PopupWindow.playersWithWindowOpen.push({ login, id: this.openId, params })
    tm.sendManialink(`${this.headerLeft}
    <label posn="${this.headerPageWidth / 2} ${-(this.headerHeight - this.margin) / 2} 3" sizen="${this.headerPageWidth} ${this.headerHeight - this.margin}" scale="1" text="${topRightText ?? ''}" valign="center" halign="center"/>
    ${this.headerRight}
    ${this.constructNavbar(login, params, privilege)}
    ${noNavbar === true ? this.noNavbarMidTop : this.frameMidTop}
    ${content}
    ${this.frameMidBottom}
    ${footer}
    ${noNavbar === true ? this.noNavbarBottom : this.frameBottom}`, login)
  }

  protected getPlayersWithWindowOpen(): string[]
  protected getPlayersWithWindowOpen(getParams: true): { login: string, params: DisplayParams }[]
  protected getPlayersWithWindowOpen(getParams?: true): string[] | { login: string, params: DisplayParams }[] {
    if (getParams === true) {
      return PopupWindow.playersWithWindowOpen.filter(a => a.id === this.openId)
        .map(a => ({ login: a.login, params: a.params }))
    }
    return PopupWindow.playersWithWindowOpen.filter(a => a.id === this.openId).map(a => a.login)
  }

}