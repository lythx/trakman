import { calculateStaticPositionY, CONFIG as CFG, CONFIG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class PreviousAndBest extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionY: number
  private readonly positionX: number
  private xml: string = ''

  constructor() {
    super(IDS.PreviousAndBest, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.previousAndBest.height
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('previousAndBest')
    this.constructXml()
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    // Z posn is set to -37 because the previous best text is at around -36 
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -37">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${CONFIG.static.bgColor}"/>
      </frame>
    </manialink>`
  }

}