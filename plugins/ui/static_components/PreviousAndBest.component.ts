import { calculateStaticPositionY, CONFIG as CFG, CONFIG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class PreviousAndBest extends StaticComponent {

  private readonly positionY: number
  private readonly positionX: number

  constructor() {
    super(IDS.PreviousAndBest, 'race')
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('previousAndBest')
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} -37">
      <quad posn="0 0 0" sizen="${CONFIG.static.width} ${CONFIG.previousAndBest.height}" bgcolor="${CONFIG.static.bgColor}"/>
    </frame>
  </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} -37">
      <quad posn="0 0 0" sizen="${CONFIG.static.width} ${CONFIG.previousAndBest.height}" bgcolor="${CONFIG.static.bgColor}"/>
    </frame>
  </manialink>`, login)
  }

}