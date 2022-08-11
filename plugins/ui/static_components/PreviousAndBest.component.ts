import { getStaticPosition, CONFIG as CFG, CONFIG, IDS } from '../UiUtils.js'
import { trakman as tm } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class PreviousAndBest extends StaticComponent {

  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.previousAndBest.height
  private readonly positionY: number
  private readonly positionX: number
  private xml: string = ''

  constructor() {
    super(IDS.previousAndBest, 'race')
    const pos = getStaticPosition('previousAndBest')
    this.positionX = pos.x
    this.positionY = pos.y
    this.constructXml()
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml, login)
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