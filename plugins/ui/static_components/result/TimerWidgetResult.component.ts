import { RESULTCONFIG as CONFIG, getResultPosition, IDS } from '../../UiUtils.js'
import { trakman as TM } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'

export default class RankWidh extends StaticComponent {

  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.timer.height
  private readonly positionX: number
  private readonly positionY: number
  private xml: string = ''

  constructor() {
    super(IDS.timerResult, 'result')
    const pos = getResultPosition('timer')
    this.positionX = pos.x
    this.positionY = pos.y
    this.constructXml()
  }

  display(): void {
    if (!this.isDisplayed) { return }
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    TM.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/>
        <quad posn="0 0 1" sizen="${this.width} ${this.height}" bgcolor="${CONFIG.static.bgColor}"/>
      </frame>
    </manialink>`
  }

}