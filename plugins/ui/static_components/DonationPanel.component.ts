import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { IDS, CONFIG, calculateStaticPositionY, stringToObjectProperty, ICONS, staticHeader, centeredText } from '../UiUtils.js'

export default class DonationPanel extends StaticComponent {

  private readonly width = CONFIG.static.width
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.donationPanel.side
  private readonly title = CONFIG.donationPanel.title
  private readonly icon = CONFIG.donationPanel.icon
  private readonly amounts = CONFIG.donationPanel.amounts
  private xml: string = ''

  constructor() {
    super(IDS.liveCheckpoint, { displayOnRace: true, hideOnResult: true })
    this.positionY = calculateStaticPositionY('donationPanel')
    this.constructXML()
    TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
      if (info.answer > this.id && info.answer <= this.id + this.amounts.length) {
        const amount = this.amounts[info.answer - (this.id + 1)]
        const status = await TM.sendCoppers(info.login, amount, 'Please give me coper')
        if (status instanceof Error) {
          TM.error(`Failed to receive ${amount} coppers donation from player ${info.login}`, status.message)
          TM.sendMessage(`${TM.palette.error}Failed to donate coppers`, info.login)
        } else if (status === true) {
          TM.sendMessage(`${info.nickName}$z$s${TM.palette.donation} donated ${amount} coppers to the server!!!!!!!!!!!!!!!!!`)
        }
      }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void | Promise<void> {
    TM.sendManialink(this.xml, login)
  }

  private constructXML(): void {
    const headerHeight: number = CONFIG.staticHeader.height
    const marginSmall: number = CONFIG.static.marginSmall
    const iconWidth: number = (this.width + marginSmall) / this.amounts.length
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    let boxXML: string = ''
    let xmltext: string = ''
    for (const [i, e] of this.amounts.entries()) {
      boxXML += `
            <quad posn="${iconWidth * i} -${CONFIG.staticHeader.height + marginSmall} 1" sizen="${iconWidth - marginSmall} ${headerHeight}" bgcolor="${CONFIG.static.bgColor}" action="${this.id + i + 1}"/>`
      xmltext += centeredText(e.toString(), iconWidth, headerHeight, { xOffset: iconWidth * i - 0.1, yOffset: headerHeight + marginSmall, padding: 0 })
    }
    this.xml = `
        <manialink id="${this.id}">
        <frame posn="${this.positionX} ${this.positionY} 1">
          <format textsize="1"/>
          ${staticHeader(this.title, iconUrl, this.side)}
          ${xmltext}
          ${boxXML}
        </frame>
      </manialink>`
  }

}