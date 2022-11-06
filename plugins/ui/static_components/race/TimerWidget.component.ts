import { componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import config from './TimerWidget.config.js'

export default class TimerWidget extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(componentIds.timer, 'race')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.constructXml()
  }

  display(): void {
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    tm.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    const headerHeight: number = this.header.options.height
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <quad posn="0 -${headerHeight + config.margin} 1" sizen="${config.width} ${config.height - (headerHeight + config.margin)}" bgcolor="${config.background}"/>
      </frame>
    </manialink>`
  }

}