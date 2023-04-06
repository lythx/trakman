import config from './Paginator.config.js'
import IDS from '../config/UtilIds.js'

const ID = IDS.Paginator

/**
 * Util to manage pagination and render page change buttons.
 * Remember to use destroy() before deleting the object to avoid memory leaks
 */
export default class Paginator {

  private _buttonCount: number = 0
  /** Parent element ID */
  readonly parentId: number
  private readonly loginPages: { readonly login: string, page: number }[] = []
  /** Default page (will be displayed if no page is specified) */
  defaultPage: number
  /** Button width */
  readonly buttonW: number = config.buttonWidth
  /** Button height */
  readonly buttonH: number = config.buttonHeight
  /** Icon padding */
  readonly padding: number = config.padding
  /** Margin between buttons */
  readonly margin: number = config.margin
  /** Icon width */
  readonly iconW: number = this.buttonW - this.padding * 2
  /** Icon height */
  readonly iconH: number = this.buttonH - this.padding * 2
  /** Ids used by paginator buttons */
  readonly ids: readonly number[] = []
  /** Paginator width */
  readonly width: number
  /** Paginator height */
  readonly height: number
  private _onPageChange: (login: string, page: number, info: tm.ManialinkClickInfo) => void = () => undefined
  private clickListener: ((params: tm.ManialinkClickInfo) => void) | undefined
  private _pageCount: number
  /** Y axis position of paginator buttons */
  readonly yPos: number
  /** X axis positions of paginator buttons */
  readonly xPos: readonly number[]
  /** If true there is no bonus gap between previous and next buttons */
  readonly noMidGap: boolean

  /**
   * Util to manage pagination and render page change buttons.
   * Remember to use destroy() before deleting the object to avoid memory leaks
   * @param parentId Parent element manialink id
   * @param parentWidth Parent element width
   * @param parentHeight Parent element height
   * @param pageCount Initial page count
   * @param defaultPage Default page (will be displayed if no page is specified)
   * @param noMidGap If true there will be no bonus gap between previous and next buttons
   */
  constructor(parentId: number, parentWidth: number, parentHeight: number, pageCount: number, defaultPage: number = 1, noMidGap?: true) {
    this.parentId = parentId
    this.width = parentWidth
    this.height = parentHeight
    this._pageCount = pageCount
    this.defaultPage = defaultPage
    this.yPos = -(parentHeight / 2)
    this.noMidGap = noMidGap ?? false
    if (noMidGap === undefined) {
      this.xPos = [
        parentWidth / 2 - (this.buttonW + this.margin) * 3,
        parentWidth / 2 - (this.buttonW + this.margin) * 2,
        parentWidth / 2 - (this.buttonW + this.margin) * 1,
        parentWidth / 2 + (this.buttonW + this.margin) * 1,
        parentWidth / 2 + (this.buttonW + this.margin) * 2,
        parentWidth / 2 + (this.buttonW + this.margin) * 3,
      ]
    } else {
      this.xPos = [
        parentWidth / 2 - (this.buttonW + this.margin) * 2.5,
        parentWidth / 2 - (this.buttonW + this.margin) * 1.5,
        parentWidth / 2 - (this.buttonW + this.margin) * 0.5,
        parentWidth / 2 + (this.buttonW + this.margin) * 0.5,
        parentWidth / 2 + (this.buttonW + this.margin) * 1.5,
        parentWidth / 2 + (this.buttonW + this.margin) * 2.5,
      ]
    }
    this.ids = Object.entries(ID).map(a => this.parentId + a[1])
    if (pageCount > 1) { this._buttonCount = 1 }
    if (pageCount > 3) { this._buttonCount = 2 }
    if (pageCount > 10) { this._buttonCount = 3 }
    this.clickListener = (info: tm.ManialinkClickInfo): void => {
      if (this.ids.includes(info.actionId)) {
        const playerPage = this.loginPages.find(a => a.login === info.login)
        if (playerPage === undefined) { // Should never happen
          const page: number = this.getPageFromClick(info.actionId, this.defaultPage)
          this.loginPages.push({ login: info.login, page: page })
          this._onPageChange(info.login, page, info)
          return
        }
        const page: number = this.getPageFromClick(info.actionId, playerPage.page)
        playerPage.page = page
        this._onPageChange(info.login, page, info)
      }
    }
    tm.addListener('ManialinkClick', this.clickListener)
  }

  /**
   * Sets function to execute on page change
   * @param callback Callback function, it takes login, page number, and ManialinkClickInfo as parameters
   */
  set onPageChange(callback: (login: string, page: number, info: tm.ManialinkClickInfo) => void) {
    this._onPageChange = callback
  }

  /**
   * Resets current player page positions.
   */
  resetPlayerPages(): void {
    this.loginPages.length = 0
  }

  /**
   * Gets current page of a given player.
   * @param login Player login
   * @returns Page number
   */
  getPageByLogin(login: string): number {
    const playerPage = this.loginPages.find(a => a.login === login)?.page ?? this.defaultPage
    return (playerPage > this._pageCount ? this.defaultPage : playerPage)
  }

  /**
   * Sets page for a given player
   * @param login Player login
   * @param page Page number
   * @returns Page number
   */
  setPageForLogin(login: string, page: number): number {
    const loginPage = this.loginPages.find(a => a.login === login)
    if (page > this._pageCount) { page = this._pageCount }
    if (page < 1) { page = 1 }
    if (loginPage === undefined) {
      this.loginPages.push({ login, page })
    } else {
      loginPage.page = page
    }
    return page
  }

  /**
   * Sets page count
   * @param pageCount Page count
   */
  setPageCount(pageCount: number): void {
    if (pageCount < 1) { pageCount = 1 }
    this._pageCount = pageCount
    this._buttonCount = 0
    if (pageCount > 1) { this._buttonCount = 1 }
    if (pageCount > 3) { this._buttonCount = 2 }
    if (pageCount > 10) { this._buttonCount = 3 }
  }

  /** Amount of currently displayed buttons. It's relative to the page count */
  get buttonCount(): number {
    return this._buttonCount
  }

  /** Amount of pages */
  get pageCount(): number {
    return this._pageCount
  }

  private getPageFromClick(id: number, page: number): number {
    switch (id) {
      case this.parentId + ID.previous:
        page--
        if (page < 1) { return 1 }
        return page
      case this.parentId + ID.next: {
        const lastPage: number = this._pageCount
        page++
        if (page > lastPage) { return lastPage }
        return page
      } case this.parentId + ID.first:
        return 1
      case this.parentId + ID.last:
        return this._pageCount
      case this.parentId + ID.jumpBackwards:
        page -= 10
        if (page < 1) { return page = 1 }
        return page
      case this.parentId + ID.jumpForwards: {
        const lastPage: number = this._pageCount
        page += 10
        if (page > lastPage) { return lastPage }
        return page
      }
      default:
        return 1
    }
  }

  /**
   * Removes click listener. Use this before deleting the object to avoid memory leaks.
   */
  destroy(): void {
    if (this.clickListener === undefined) { return }
    tm.removeListener(this.clickListener)
    this.clickListener = undefined
  }

  /**
   * Constructs page change buttons XML for given page number
   * @param page Page number
   * @returns Page change buttons XML string
   */
  constructXml(page: number): string
  /**
   * Constructs page change buttons XML for given player login
   * @param login Player login
   * @returns Page change buttons XML string
   */
  constructXml(login: string): string
  constructXml(arg: number | string): string {
    let page: number
    if (typeof arg === 'string') {
      page = this.loginPages.find(a => a.login === arg)?.page ?? this.defaultPage
    } else {
      page = arg
    }
    if (this._buttonCount === 0) {
      return ``
    }
    let xml: string = ''
    if (page !== 1) {
      xml += `<quad posn="${this.xPos[2]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.previous}" 
        imagefocus="${config.iconsHover[2]}"
        image="${config.icons[2]}"/>`
      if (this._buttonCount > 2) {
        xml += `<quad posn="${this.xPos[0]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.first}" 
            imagefocus="${config.iconsHover[0]}"
            image="${config.icons[0]}"/>
            <quad posn="${this.xPos[1]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.jumpBackwards}" 
            imagefocus="${config.iconsHover[1]}"
            image="${config.icons[1]}"/>`
      }
      else if (this._buttonCount > 1) {
        xml += `<quad posn="${this.xPos[1]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.first}" 
        imagefocus="${config.iconsHover[0]}"
        image="${config.icons[0]}"/>`
      }
    }
    xml += `<quad posn="${this.xPos[2]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${config.background}"/>`
    if (this._buttonCount > 1) {
      xml += `<quad posn="${this.xPos[1]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${config.background}"/>`
    }
    if (this._buttonCount > 2) {
      xml += `<quad posn="${this.xPos[0]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${config.background}"/>`
    }
    if (page !== this._pageCount) {
      xml += `<quad posn="${this.xPos[3]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.next}" 
      imagefocus="${config.iconsHover[3]}"
      image="${config.icons[3]}"/>`
      if (this._buttonCount > 2) {
        xml += `<quad posn="${this.xPos[4]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.jumpForwards}" 
          imagefocus="${config.iconsHover[4]}"
          image="${config.icons[4]}"/>
          <quad posn="${this.xPos[5]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.last}" 
          imagefocus="${config.iconsHover[5]}"
          image="${config.icons[5]}"/>`
      }
      else if (this._buttonCount > 1) {
        xml += `<quad posn="${this.xPos[4]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.last}" 
          imagefocus="${config.iconsHover[5]}"
          image="${config.icons[5]}"/>`
      }
    }
    xml += `<quad posn="${this.xPos[3]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${config.background}"/>`
    if (this._buttonCount > 1) {
      xml += `<quad posn="${this.xPos[4]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${config.background}"/>`
    }
    if (this._buttonCount > 2) {
      xml += `<quad posn="${this.xPos[5]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${config.background}"/> `
    }
    return xml
  }

}
