import { calculateStaticPositionY, CONFIG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class RankWidget extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionY: number
  private readonly positionX: number
  private xml: string = ''

  constructor() {
    super(IDS.rank, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.rank.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('rank')
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
    // Z posn is set to -37 because the rank text is at around -36 
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -37">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${CONFIG.static.bgColor}"/>
      </frame>
    </manialink>`
  }

}

