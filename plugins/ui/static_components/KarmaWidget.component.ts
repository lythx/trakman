import { calculateStaticPositionY, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class KarmaWidget extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private xml: string = ''

  constructor() {
    super(IDS.KarmaWidget, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.karma.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('karma')
    this.updateXML()
    this.display()
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const marginSmall = CONFIG.static.marginSmall
    const headerHeight = CONFIG.staticHeader.height
    this.xml = `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.karma.title, stringToObjectProperty(CONFIG.karma.icon, ICONS), false)}
        <quad posn="0 -${headerHeight + marginSmall} 1" sizen="${this.width} ${this.height - (headerHeight + marginSmall)}" bgcolor="${CONFIG.static.bgColor}"/>
      </frame>
    </manialink>`
  }

}

