import { calculateStaticPositionY, CONFIG, ICONS, IDS, staticHeader } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class TimerWidget extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number

  constructor() {
    super(IDS.TimerWidget, 'race')
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('timer')
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} -38">
      <format textsize="1" textcolor="FFFF"/> 
      ${staticHeader('Timer', ICONS.timer)}
      <quad posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1" sizen="${CONFIG.static.width} ${CONFIG.timer.height - (CONFIG.staticHeader.height + CONFIG.static.marginSmall)}" bgcolor="${CONFIG.static.bgColor}"/>
    </frame>
  </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} -38">
      <format textsize="1" textcolor="FFFF"/> 
      ${staticHeader('Timer', ICONS.timer)}
      <quad posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1" sizen="${CONFIG.static.width} ${CONFIG.timer.height - (CONFIG.staticHeader.height + CONFIG.static.marginSmall)}" bgcolor="${CONFIG.static.bgColor}"/>
    </frame>
  </manialink>`, login)
  }

}