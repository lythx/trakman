import { Events } from "../../../src/Events.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import IPopupWindow from "./PopupWindow.interface.js";
import CFG from "../UIConfig.json" assert {type: "json"}

export default abstract class PopupWindow extends DynamicComponent implements IPopupWindow {

  readonly openId: number
  readonly closeId: number
  private readonly frameTop: string
  private readonly frameTopMid: string
  private readonly frameMidBottom: string
  private readonly frameBottom: string
  private readonly windowWidth: number = 80.4
  private readonly windowHeight: number = 55.7
  private readonly titleHeight: number = 2.1 * 2

  constructor(openId: number, closeId: number, contentHeight?: number, contentWidth?: number) {
    super(openId)
    this.openId = openId
    this.closeId = closeId
    if (contentHeight !== undefined) { this.windowHeight = contentHeight + (2 * this.titleHeight) + 1.7 }
    if (contentWidth !== undefined) { this.windowWidth = contentWidth + 1.6; }
    [this.frameTop, this.frameTopMid, this.frameMidBottom, this.frameBottom] = this.constructFrame()
    Events.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (Number(info.answer) === this.openId) { this.displayToPlayer(info.login) }
      else if (Number(info.answer) === this.closeId) { this.closeToPlayer(info.login) }
    })
  }

  private constructFrame(): string[] {
    return [ // TODO window frame code. The first element in array is very top of manialink, 2nd is bottom
      `<manialink id="${this.id}">
        <frame posn="-${this.windowWidth / 2} ${this.windowHeight / 2} 10">
          <quad posn="0 0 0.02" sizen="${this.windowWidth} ${this.windowHeight}" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
            <frame posn="0.4 -0.44 1">
            <quad posn="0 0 0" sizen="${this.windowWidth - 0.8} ${this.titleHeight}" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>`,
      `
        </frame>
        <frame posn="0.4 -5 1">
          <quad posn="0 0 0" sizen="${this.windowWidth - 0.8} ${this.windowHeight - (2 * this.titleHeight) - 1.7}" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>
          <frame posn="1 -1.5 0.02">`,
      `
          </frame>
        </frame>
          <frame posn="0.4 -${this.windowHeight - this.titleHeight - 0.44} 1">
            <quad posn="0 0 0" sizen="${this.windowWidth - 0.8} ${this.titleHeight}" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>`,
      `
          </frame>
        </frame>
      </manialink>`
    ]
  }

  constructHeader(login: string): string {
    return `<quad posn="2.5 -${this.titleHeight / 2} 0.04" sizen="3.5 3.5" halign="center" valign="center" style="Icons64x64_1" substyle="TV"/>
        <label posn="${(this.windowWidth - 0.8) / 2} -${this.titleHeight / 2} 0.04" sizen="${this.windowWidth} ${this.windowHeight}" halign="center" valign="center" textsize="3" text="$STITLE_HERE_MAN_XD"/>`
  }

  constructContent(login: string): string {
    return ``
  }

  constructFooter(login: string): string {
    return `<quad posn="${(this.windowWidth - 0.8) / 2 - 0.2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
  }

  displayToPlayer(login: string): void {
    const header = this.constructHeader(login)
    const content = this.constructContent(login)
    const footer = this.constructFooter(login)
    TM.sendManialink(`${this.frameTop}${header}${this.frameTopMid}${content}${this.frameMidBottom}${footer}${this.frameBottom}`, login)
  }

}