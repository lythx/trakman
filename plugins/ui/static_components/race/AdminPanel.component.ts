import { IDS, StaticHeader } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import config from './AdminPanel.config.js'

export default class AdminPanel extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(IDS.admin, 'race')
    const pos = this.getRelativePosition() // TODO MAKE STATIC POSITION A CLASS METHOD
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.constructXml()
    tm.addListener('Controller.PrivilegeChanged', (info) => {
      this.displayToPlayer(info.login)
    })
  }

  display(): void {
    for (const e of tm.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    const privilege: number = tm.players.get(login)?.privilege ?? 0
    if (privilege > 0) {
      tm.sendManialink(this.xml, login)
    }
  }

  private constructXml(): void {
    let iconsXml: string = ''
    const iconWidth: number = config.width / config.icons.length
    const headerH = this.header.options.height
    for (const [i, e] of config.icons.entries()) {
      iconsXml += `
      <quad posn="${iconWidth * i} -${headerH + config.margin} 1" sizen="${iconWidth - config.margin} 
      ${config.height - (headerH + config.margin)}" bgcolor="${config.background}"/>
      <quad posn="${iconWidth * i + config.margin} -${headerH + config.margin * 2} 2" 
      sizen="${iconWidth - config.margin * 3} ${config.height - (headerH + config.margin * 3)}" image="${e}"/>`
    }
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side)}
        ${iconsXml}
      </frame>
    </manialink>`
  }

}