import { calculateStaticPositionY, CONFIG, ICONS, IDS, staticHeader, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class AdminPanel extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private xml: string = ''

  constructor() {
    super(IDS.admin, { displayOnRace: true, hideOnResult: true })
    this.width = CONFIG.static.width
    this.height = CONFIG.admin.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('admin')
    this.constructXml()
    TM.addListener('Controller.PrivilegeChanged', (info) => {
      if (this._isDisplayed === true) {
        this.displayToPlayer(info.login)
      }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const e of TM.players) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    const player = TM.getPlayer(login)
    if (player !== undefined && player.privilege > 0) {
      TM.sendManialink(this.xml, login)
    } else {
      TM.sendManialink(`<manialink id=${this.id}></manialink>`)
    }
  }

  private constructXml(): void {
    const headerHeight: number = CONFIG.staticHeader.height
    const marginSmall: number = CONFIG.static.marginSmall
    const icons: string[] = CONFIG.admin.icons
    let iconsXml: string = ''
    const iconWidth: number = this.width / icons.length
    for (const [i, e] of icons.entries()) {
      iconsXml += `
      <quad posn="${iconWidth * i} -${CONFIG.staticHeader.height + marginSmall} 1" sizen="${iconWidth - marginSmall} ${this.height - (headerHeight + marginSmall)}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${iconWidth * i + marginSmall} -${CONFIG.staticHeader.height + marginSmall * 2} 2" sizen="${iconWidth - marginSmall * 3} ${this.height - (headerHeight + marginSmall * 3)}" image="${stringToObjectProperty(e, ICONS)}"/>`
    }
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.admin.title, stringToObjectProperty(CONFIG.admin.icon, ICONS), false)}
        ${iconsXml}
      </frame>
    </manialink>`
  }

}