import { TRAKMAN as TM } from '../../../src/Trakman.js'
import ICN from '../config/Icons.json' assert { type: 'json'}
import IDS from '../config/UtilIds.json' assert { type: 'json'}
import { CONFIG } from '../UiUtils.js'

const ID = IDS.Paginator

//TODO IMPLEMENT OPTIONAL PARAMS FOR ICON SIZE AND MAKE POSITION RELATIVE IF POSSIBLE

export default class Paginator {

  buttonCount = 0
  readonly parentId: number
  readonly loginPages: { readonly login: string, page: number }[] = []
  readonly defaultPage: number
  readonly buttonW = CONFIG.paginator.buttonWidth
  readonly buttonH = CONFIG.paginator.buttonHeight
  readonly padding = CONFIG.paginator.padding
  readonly iconW = this.buttonW - this.padding * 2
  readonly iconH = this.buttonH - this.padding * 2
  readonly ids: number[] = []
  readonly width: number
  readonly height: number
  readonly margin = CONFIG.paginator.margin
  readonly emptyBg = CONFIG.paginator.background
  pageCount: number
  yPos: number
  xPos: number[]

  constructor(parentId: number, parentWidth: number, parentHeight: number, pageCount: number, defaultPage: number = 1) {
    this.parentId = parentId
    this.width = parentWidth
    this.height = parentHeight
    this.pageCount = pageCount
    this.defaultPage = defaultPage
    this.yPos = -(parentHeight / 2)
    this.xPos = [
      parentWidth / 2 - (this.buttonW + this.margin) * 3,
      parentWidth / 2 - (this.buttonW + this.margin) * 2,
      parentWidth / 2 - (this.buttonW + this.margin) * 1,
      parentWidth / 2 + (this.buttonW + this.margin) * 1,
      parentWidth / 2 + (this.buttonW + this.margin) * 2,
      parentWidth / 2 + (this.buttonW + this.margin) * 3,
    ]
    this.ids = Object.entries(ID).map(a => this.parentId + a[1])
    if (pageCount > 1) { this.buttonCount = 1 }
    if (pageCount > 3) { this.buttonCount = 2 }
    if (pageCount > 10) { this.buttonCount = 3 }
  }

  onPageChange(callback: (login: string, page: number) => void) {
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (this.ids.includes(info.answer)) {
        const playerPage = this.loginPages.find(a => a.login === info.login)
        if (playerPage === undefined) { // Should never happen
          const page = this.getPageFromClick(info.answer, this.defaultPage)
          this.loginPages.push({ login: info.login, page: page })
          callback(info.login, page)
          return
        }
        const page = this.getPageFromClick(info.answer, playerPage.page)
        playerPage.page = page
        callback(info.login, page)
      }
    })
  }

  getPageByLogin(login: string): number | undefined {
    return this.loginPages.find(a => a.login === login)?.page
  }

  updatePageCount(pageCount: number) {
    this.pageCount = pageCount
    if (pageCount > 1) { this.buttonCount = 1 }
    if (pageCount > 3) { this.buttonCount = 2 }
    if (pageCount > 10) { this.buttonCount = 3 }
  }

  getPageFromClick(id: number, page: number) {
    switch (id) {
      case this.parentId + ID.previous:
        page--
        if (page < 1) { return 1 }
        return page
      case this.parentId + ID.next: {
        const lastPage = this.pageCount
        page++
        if (page > lastPage) { return lastPage }
        return page
      } case this.parentId + ID.first:
        return 1
      case this.parentId + ID.last:
        return this.pageCount
      case this.parentId + ID.jumpBackwards:
        page -= 10
        if (page < 1) { return page = 1 }
        return page
      case this.parentId + ID.jumpForwards: {
        const lastPage = this.pageCount
        page += 10
        if (page > lastPage) { return lastPage }
        return page
      }
      default:
        return 1
    }
  }

  constructXml(page: number) {
    if (this.buttonCount === 0) {
      return ``
    }
    let xml = ''
    if (page !== 1) {
      xml += `<quad posn="${this.xPos[2]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.previous}" 
        imagefocus="${ICN.arrowL}"
        image="${ICN.arrowL}"/>`
      if (this.buttonCount > 2) {
        xml += `<quad posn="${this.xPos[0]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.first}" 
            imagefocus="${ICN.arrowFirst}"
            image="${ICN.arrowFirst}"/>
            <quad posn="${this.xPos[1]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.jumpBackwards}" 
            imagefocus="${ICN.arrowDoubleL}"
            image="${ICN.arrowDoubleL}"/>`
      }
      else if (this.buttonCount > 1) {
        xml += `<quad posn="${this.xPos[1]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.first}" 
        imagefocus="${ICN.arrowFirst}"
        image="${ICN.arrowFirst}"/>`
      }
    }
    xml += `<quad posn="${this.xPos[2]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${this.emptyBg}"/>`
    if (this.buttonCount > 1) {
      xml += `<quad posn="${this.xPos[1]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${this.emptyBg}"/>`
    }
    if (this.buttonCount > 2) {
      xml += `<quad posn="${this.xPos[0]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${this.emptyBg}"/>`
    }
    if (page !== this.pageCount) {
      xml += `<quad posn="${this.xPos[3]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.next}" 
      imagefocus="${ICN.arrowR}"
      image="${ICN.arrowR}"/>`
      if (this.buttonCount > 2) {
        xml += `<quad posn="${this.xPos[4]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.jumpForwards}" 
          imagefocus="${ICN.arrowDoubleR}"
          image="${ICN.arrowDoubleR}"/>
          <quad posn="${this.xPos[5]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.last}" 
          imagefocus="${ICN.arrowLast}"
          image="${ICN.arrowLast}"/>`
      }
      else if (this.buttonCount > 1) {
        xml += `<quad posn="${this.xPos[4]} ${this.yPos} 3" sizen="${this.iconW} ${this.iconH}" halign="center" valign="center" action="${this.parentId + ID.last}" 
          imagefocus="${ICN.arrowLast}"
          image="${ICN.arrowLast}"/>`
      }
    }
    xml += `<quad posn="${this.xPos[3]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${this.emptyBg}"/>`
    if (this.buttonCount > 1) {
      xml += `<quad posn="${this.xPos[4]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${this.emptyBg}"/>`
    }
    if (this.buttonCount > 2) {
      xml += `<quad posn="${this.xPos[5]} ${this.yPos} 1" sizen="${this.buttonW} ${this.buttonH}" halign="center" valign="center" bgcolor="${this.emptyBg}"/> `
    }
    return xml
  }
}