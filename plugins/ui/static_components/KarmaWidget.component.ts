import { calculateStaticPositionY, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class KarmaWidget extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number

  constructor() {
    super(IDS.KarmaWidget, 'race')
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('karma')
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} -37">
      <format textsize="1" textcolor="FFFF"/> 
      ${staticHeader('Karma', ICONS.heart)}
      <quad posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 0" sizen="${CONFIG.static.width} ${CONFIG.karma.height - (CONFIG.staticHeader.height + CONFIG.static.marginSmall)}" bgcolor="${CONFIG.static.bgColor}"/>
    </frame>
  </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} -37">
      <format textsize="1" textcolor="FFFF"/> 
      ${staticHeader('Karma', ICONS.heart)}
      <quad posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 0" sizen="${CONFIG.static.width} ${CONFIG.karma.height}" bgcolor="${CONFIG.static.bgColor}"/>
    </frame>
  </manialink>`, login)
  }

}

