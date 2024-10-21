import { componentIds } from '../UI.js'
import DynamicComponent from './DynamicComponent.js'
import utilIds from '../config/UtilIds.js'
import Navbar from './Navbar.js'
import config from '../config/PopupWindow.js'
import { centeredText } from '../UI.js'

/**
 * Abstract class for manialink popup windows.
 * DisplayParams is type passed from display function to construct functions
 */
export default abstract class PopupWindow<DisplayParams = any> extends DynamicComponent {

  /** Action ID used to open the window */
  readonly openId: number
  /** Action ID used to close the window */
  readonly closeId: number
  /** Header image url */
  protected readonly headerIcon: string
  /** Header title */
  protected readonly title: string
  private readonly headerLeft: string
  private readonly headerRight: string
  private readonly frameMidTop: string
  private readonly frameMidBottom: string
  private readonly frameBottom: string
  private readonly noNavbarMidTop: string
  private readonly noNavbarBottom: string
  /** Navbar object */
  protected readonly navbar: Navbar
  /** Navbar height */
  protected readonly navbarHeight: number
  /** Full window width */
  protected readonly windowWidth: number
  /** Full window height */
  protected readonly windowHeight: number
  /** Window content width (middle part) */
  protected readonly contentWidth: number
  /** Window content height (middle part) */
  protected readonly contentHeight: number
  /** Header height */
  protected readonly headerHeight: number = config.headerHeight
  /** Header background colour */
  protected readonly headerBackground: string = config.headerBg
  /** Background colour */
  protected readonly background: string = config.bg
  /** Margin between window parts */
  protected readonly margin: number = config.margin
  /** Footer height */
  protected readonly footerHeight: number = config.footerHeight
  /** Right header part width (usually used for page display) */
  protected readonly headerPageWidth: number = config.headerPageWidth
  private static readonly playersWithWindowOpen: { login: string, id: number, params: any }[] = []

  /**
   * Abstract class for manialink popup windows
   * @param windowId Window ID. All PopupWindows have the same manialink ID. Use openId to access this property
   * @param headerIcon Header image url
   * @param title Header title
   * @param navbar Array of objects containing navbar entry name, action ID and optional privilege
   * @param windowWidth Window width
   * @param windowHeight Window height
   */
  constructor(windowId: number, headerIcon: string, title: string,
    navbar: { name: string, actionId: number, privilege?: number }[] = [],
    windowWidth: number = config.windowWidth, windowHeight: number = config.windowHeight) {
    super(componentIds.PopupWindow)
    this.headerIcon = headerIcon
    this.title = title
    this.openId = windowId + utilIds.PopupWindow.open
    this.closeId = windowId + utilIds.PopupWindow.close
    this.windowHeight = windowHeight
    this.windowWidth = windowWidth
    this.navbar = new Navbar(navbar, this.windowWidth)
    this.navbarHeight = this.navbar.height
    this.contentWidth = windowWidth
    this.contentHeight = windowHeight - (2 * this.headerHeight + this.navbarHeight + 2 * this.margin);
    [this.headerLeft, this.headerRight, this.frameMidTop,
      this.frameMidBottom, this.frameBottom, this.noNavbarMidTop, this.noNavbarBottom] = this.constructFrame()
    tm.addListener('ManialinkClick', (info: tm.ManialinkClickInfo): void => {
      if (info.actionId === this.openId) {
        tm.log.trace(`Player ${tm.utils.strip(info.nickname)} (${info.login}) opened ${this.constructor.name} manialink.`)
        this.onOpen(info)
      }
      else if (info.actionId === this.closeId) {
        const index: number = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === info.login)
        if (index !== -1) {
          PopupWindow.playersWithWindowOpen.splice(index, 1)
        }
        this.onClose(info)
      }
    })
    tm.addListener('PlayerLeave', (info: tm.LeaveInfo): void => {
      const index: number = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === info.login)
      if (index !== -1) {
        PopupWindow.playersWithWindowOpen.splice(index, 1)
        this.onClose({ ...info, actionId: this.closeId })
      }
    })
  }

  /**
   * Method called on openId action ID. By default it displays the window to the player.
   * @param info Manialink event info
   */
  protected onOpen(info: tm.ManialinkClickInfo): void {
    this.displayToPlayer(info.login, undefined, undefined, info.privilege)
  }

  /**
   * Method called on openId action ID. By default it hides the window to the player.
   * @param info Manialink event info
   */
  protected onClose(info: tm.ManialinkClickInfo): void {
    this.hideToPlayer(info.login)
  }

  private _constructHeader(title?: string, icon?: string) {
    return `<manialink id="${this.id}">
        <frame posn="-${this.windowWidth / 2} ${this.windowHeight / 2} 5">
          <frame posn="0 0 5">
            <quad posn="0 0 2" sizen="${this.headerHeight} ${this.headerHeight}" bgcolor="${this.headerBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.headerHeight - this.margin * 2} ${this.headerHeight - this.margin * 2}" image="${icon ?? this.headerIcon}"/>
            <quad posn="${this.headerHeight + this.margin} 0 2" sizen="${this.windowWidth - (this.headerHeight + this.headerPageWidth + this.margin * 2)} ${this.headerHeight}" bgcolor="${this.headerBackground}"/>
            <label posn="${this.windowWidth / 2} -${this.headerHeight / 2} 5" sizen="${this.windowWidth} ${this.headerHeight}" scale="${config.textScale}" text="${tm.utils.safeString(title ?? this.title)}" valign="center" halign="center"/>
            <frame posn="${this.headerHeight + this.windowWidth - (this.headerHeight + this.headerPageWidth)} 0 4">
              <quad posn="0 0 2" sizen="${this.headerPageWidth} ${this.headerHeight}" bgcolor="${this.headerBackground}"/>`
  }

  private constructFrame(): string[] {
    return [
      this._constructHeader(),
      `
            </frame>
          </frame>
          <frame posn="0 ${-(this.headerHeight + this.margin)} 5">`,
      `</frame>
          <frame posn="0 ${-(this.headerHeight + this.navbarHeight + this.margin * 2)} 5">
            <quad posn="0 0 2" sizen="${this.windowWidth} ${this.windowHeight - (this.headerHeight * 2 + this.margin * 2 + this.navbarHeight)}" bgcolor="${this.background}"/>
            <frame posn="0 0 1">`,
      `
          </frame>
        </frame>
          <frame posn="0 -${this.windowHeight - (this.footerHeight - this.margin)} 5">
            <quad posn="0 0 2" sizen="${this.windowWidth} ${this.footerHeight}" bgcolor="${this.headerBackground}"/>`,
      `
          </frame>
        </frame>
      </manialink>`,
      `</frame>
      <frame posn="0 ${this.navbarHeight + this.margin} 1">
        <frame posn="0 ${-(this.headerHeight + this.navbarHeight + this.margin * 2)} 5">
          <quad posn="0 0 2" sizen="${this.windowWidth} ${this.windowHeight - (this.headerHeight * 2 + this.margin * 2 + this.navbarHeight)}" bgcolor="${this.background}"/>
          <frame posn="0 0 1">`,
      `     </frame>
          </frame>
        </frame>
      </manialink>`
    ]
  }

  /**
   * Method called on displayToPlayer, by default it constructs navbar from parameters passed to constructor.
   * @param login Player login
   * @param params Display params passed to displayToPlayer
   * @param privilege Player privilege
   * @returns Navbar XML string
   */
  protected constructNavbar(login: string, params?: DisplayParams, privilege?: number): string {
    return this.navbar.constructXml(privilege)
  }

  /**
   * Method called on displayToPlayer. It returns manialink XML string to be displayed inside window content.
   * @param login Player login
   * @param params Display params passed to displayToPlayer
   * @param privilege Player privilege
   * @returns Content XML string
   */
  protected abstract constructContent(login: string, params?: DisplayParams, privilege?: number): string | Promise<string>

  /**
   * Method called on displayToPlayer. It returns manialink XML string to be displayed inside window footer.
   * @param login Player login
   * @param params Display params passed to displayToPlayer
   * @param privilege Player privilege
   * @returns Footer XML string
   */
  protected abstract constructFooter(login: string, params?: DisplayParams, privilege?: number): string | Promise<string>

  /**
   * Displays window to given player based on manialink XML strings returned by construct methods.
   * @param login Player login
   * @param params Display params to be passed to construct methods
   * @param topRightText Text displayed in right part of the header
   * @param privilege Player privilege
   * @param title If set given title is displayed instead of the title passed in constructor
   * @param icon If set given icon is displayed instead of the icon passed in constructor
   */
  async displayToPlayer(login: string, params?: DisplayParams, topRightText?: string, privilege?: number,
    title?: string, icon?: string): Promise<void> {
    const content: string = await this.constructContent(login, params, privilege)
    const footer: string = await this.constructFooter(login, params, privilege)
    const index: number = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === login)
    if (index !== -1) {
      PopupWindow.playersWithWindowOpen.splice(index, 1)
    }
    const noNavbar: boolean = this.navbar.getButtonCount(privilege) === 0
    PopupWindow.playersWithWindowOpen.push({ login, id: this.openId, params })
    tm.sendManialink(`${(title !== undefined || icon !== undefined) ? this._constructHeader(title, icon) : this.headerLeft}
    ${centeredText(topRightText ?? '', this.headerPageWidth, this.headerHeight - this.margin, { textScale: config.textScale })}
    ${this.headerRight}
    ${this.constructNavbar(login, params, privilege)}
    ${noNavbar ? this.noNavbarMidTop : this.frameMidTop}
    ${content}
    ${this.frameMidBottom}
    ${footer}
    ${noNavbar ? this.noNavbarBottom : this.frameBottom}`, login)
  }

  /**
   * Gets logins of players who currently have the window open
   * @returns Array of logins
   */
  protected getPlayersWithWindowOpen(): string[]
  /**
   * Gets logins and display params of players who currently have the window open
   * @param getParams If set gets objects instead of logins
   * @returns Array of objects containing player logins and display params
   */
  protected getPlayersWithWindowOpen(getParams: true): { login: string, params: DisplayParams }[]
  protected getPlayersWithWindowOpen(getParams?: true): string[] | { login: string, params: DisplayParams }[] {
    if (getParams === true) {
      return PopupWindow.playersWithWindowOpen.filter(a => a.id === this.openId)
        .map(a => ({ login: a.login, params: a.params }))
    }
    return PopupWindow.playersWithWindowOpen.filter(a => a.id === this.openId).map(a => a.login)
  }

}
