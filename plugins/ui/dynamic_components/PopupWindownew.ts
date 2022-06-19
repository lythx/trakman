import { Events } from "../../../src/Events.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import IPopupWindow from "./PopupWindow.interface.js";
import CFG from "../UIConfig.json" assert {type: "json"}
import BG from "../Backgrounds.json" assert { type: "json" }

export default abstract class PopupWindow extends DynamicComponent {

  readonly openId: number
  readonly closeId: number
  private readonly frameTop: string
  private readonly frameTopMid: string
  private readonly frameMidBottom: string
  private readonly frameBottom: string
  private readonly windowWidth: number
  private readonly windowHeight: number
  private readonly titleHeight: number = 4

  constructor(openId: number, closeId: number, contentHeight: number = 50, contentWidth: number = 80) {
    super(openId)
    this.openId = openId
    this.closeId = closeId
    this.windowHeight = contentHeight + (2 * this.titleHeight)
    this.windowWidth = contentWidth;
    [this.frameTop, this.frameTopMid, this.frameMidBottom, this.frameBottom] = this.constructFrame()
    this.setupListeners()
  }

  abstract setupListeners(): void

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

  abstract constructHeader(login: string, params: any): string

  abstract constructContent(login: string, params: any): string

  abstract constructFooter(login: string, params: any): string

  displayToPlayer(login: string, params?: any): void {
    const header = this.constructHeader(login, params)
    const content = this.constructContent(login, params)
    const footer = this.constructFooter(login, params)
    TM.sendManialink(`${this.frameTop}${header}${this.frameTopMid}${content}${this.frameMidBottom}${footer}${this.frameBottom}`, login)
  }

  protected defaultHeader(title: string, iconUrl: string, iconW: number, iconH: number, rightText?: string): string {
    return `<quad posn="2 -${this.titleHeight / 2} 9" sizen="${iconW} ${iconH}" halign="center" valign="center" image="${iconUrl}"/>
        <label posn="${this.windowWidth / 2} -${this.titleHeight / 2} 1" sizen="${this.windowWidth * (1 / 1)} ${this.windowHeight}" halign="center" valign="center" scale="1" text="${title}"/>
        <label posn="${this.windowWidth - 3} -${this.titleHeight / 2} 1" sizen="${this.windowWidth * (1 / 0.8)} ${this.windowHeight}" halign="center" valign="center" scale="0.8" text="${rightText ?? ''}"/>`
  }

  protected defaultFooter(): string {
    return `<quad posn="${(this.windowWidth - 0.8) / 2 - 0.2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
  }

}