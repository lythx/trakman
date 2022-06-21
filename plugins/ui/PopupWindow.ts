import { TRAKMAN as TM } from "../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import { BACKGROUNDS as BG, IDS } from './UiUtils.js'
import UTILIDS from './config/UtilIds.json' assert { type: 'json' }

export default abstract class PopupWindow extends DynamicComponent {

  readonly openId: number
  readonly closeId: number
  private readonly frameTop: string
  private readonly frameTopMid: string
  private readonly frameMidBottom: string
  private readonly frameBottom: string
  protected readonly windowWidth: number
  protected readonly windowHeight: number
  //TODO THIS IN CONFIG FILE
  protected readonly titleHeight: number = 4

  constructor(windowId: number, contentHeight: number = 50, contentWidth: number = 80) {
    super(IDS.PopupWindow)
    this.openId = windowId + UTILIDS.PopupWindow.open
    this.closeId = windowId + UTILIDS.PopupWindow.close
    this.windowHeight = contentHeight + (2 * this.titleHeight)
    this.windowWidth = contentWidth;
    [this.frameTop, this.frameTopMid, this.frameMidBottom, this.frameBottom] = this.constructFrame()
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
    return [
      `<manialink id="${this.id}">
        <frame posn="-${this.windowWidth / 2} ${this.windowHeight / 2} 5">
          <quad posn="0 0 0" sizen="${this.windowWidth} ${this.windowHeight}" image="${BG.black60}"/>
            <frame posn="0 0 1">
            <quad posn="0 0 0" sizen="${this.windowWidth} ${this.titleHeight}" image="${BG.darkblue}"/>`,
      `
        </frame>
        <frame posn="0 -${this.titleHeight} 5">
          <quad posn="0 0 0" sizen="${this.windowWidth} ${this.windowHeight - (2 * this.titleHeight)}" bgcolor="0009"/>
          <frame posn="0 0 1">`,
      `
          </frame>
        </frame>
          <frame posn="0 -${this.windowHeight - this.titleHeight} 5">
          <quad posn="0 0 0" sizen="${this.windowWidth} ${this.titleHeight}" image="${BG.darkblue}"/>`,
      `
          </frame>
        </frame>
      </manialink>`
    ]
  }

  protected abstract constructHeader(login: string, params: any): string

  protected abstract constructContent(login: string, params: any): string

  protected abstract constructFooter(login: string, params: any): string

  displayToPlayer(login: string, params?: any): void {
    const header = this.constructHeader(login, params)
    const content = this.constructContent(login, params)
    const footer = this.constructFooter(login, params)
    TM.sendManialink(`${this.frameTop}${header}${this.frameTopMid}${content}${this.frameMidBottom}${footer}${this.frameBottom}`, login)
  }

}