import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    this.positionY = calculateStaticPositionY('liveCheckpoint')
  }

  display(): void {
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
      </frame>
    </manialink>`, login)
  }

}