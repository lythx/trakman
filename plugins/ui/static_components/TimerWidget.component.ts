import { calculateStaticPositionY, CONFIG, ICONS, IDS, staticHeader, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class TimerWidget extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private xml: string = ''

  constructor() {
    super(IDS.TimerWidget, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.timer.height
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('timer')
    this.constructXml()
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private constructXml() {
    const headerHeight = CONFIG.staticHeader.height
    const marginSmall = CONFIG.static.marginSmall
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.timer.title, stringToObjectProperty(CONFIG.timer.icon, ICONS), true)}
        <quad posn="0 -${headerHeight + marginSmall} 1" sizen="${this.width} ${this.height - (headerHeight + marginSmall)}" bgcolor="${CONFIG.static.bgColor}"/>
        <quad posn="10.8 -2.6 3" sizen="4.2 3.3" image="${stringToObjectProperty(CONFIG.timer.hourglassOverlay, ICONS)}"/>
      </frame>
    </manialink>`
  }

}