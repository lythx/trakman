import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { IDS, CONFIG, getStaticPosition, stringToObjectProperty, ICONS, staticHeader, centeredText } from '../UiUtils.js'

export default class DonationPanel extends StaticComponent {

  private readonly width = CONFIG.static.width
  private readonly positionX: number
  private readonly positionY: number
  private readonly side = CONFIG.donationPanel.side
  private readonly title = CONFIG.donationPanel.title
  private readonly icon = CONFIG.donationPanel.icon
  private readonly amounts = CONFIG.donationPanel.amounts
  private xml: string = ''

  constructor() {
    super(IDS.liveCheckpoint, 'race')
    const pos = getStaticPosition('donationPanel')
    this.positionX = pos.x
    this.positionY = pos.y
    this.constructXML()
    TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
      if (info.answer > this.id && info.answer <= this.id + this.amounts.length) {
        const amount = this.amounts[info.answer - (this.id + 1)]
        const status = await TM.sendCoppers(info.login, amount, 'Please give me coper')
        if (status instanceof Error) {
          TM.error(`Failed to receive ${amount} coppers donation from player ${info.login}`, status.message)
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to process payment.`, info.login)
        } else if (status === true) {
          TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname)}${TM.utils.palette.donation} `
            + `donated ${TM.utils.palette.highlight}${amount}C${TM.utils.palette.donation} to the server.`)
        }
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const player of TM.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void | Promise<void> {
    if (this.isDisplayed === false) { return }
    if (TM.players.get(login)?.isUnited) {
      TM.sendManialink(this.xml, login)
    }
  }

  private constructXML(): void {
    const headerHeight: number = CONFIG.staticHeader.height
    const marginSmall: number = CONFIG.marginSmall
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