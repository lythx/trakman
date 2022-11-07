/**
 * @author lythx
 * @since 0.1
 */

import { donations } from '../../../donations/Donations.js'
import { componentIds, StaticHeader, centeredText, StaticComponent } from '../../UI.js'
import config from './DonationPanel.config.js'

export default class DonationPanel extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(componentIds.liveCheckpoint, 'race')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.constructXML()
    tm.addListener('ManialinkClick', (info: tm.ManialinkClickInfo): void => {
      if (info.actionId > this.id && info.actionId <= this.id + config.amounts.length) {
        const amount: number = config.amounts[info.actionId - (this.id + 1)]
        void donations.donate(info.login, info.nickname, amount)
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void | Promise<void> {
    if (this.isDisplayed === false) { return }
    if (tm.players.get(login)?.isUnited === true) {
      tm.sendManialink(this.xml, login)
    }
  }

  private constructXML(): void {
    const headerHeight: number = this.header.options.height
    const marginSmall: number = config.margin
    const iconWidth: number = (config.width + marginSmall) / config.amounts.length
    let boxXML: string = ''
    let xmltext: string = ''
    for (const [i, e] of config.amounts.entries()) {
      boxXML += `
            <quad posn="${iconWidth * i} -${headerHeight + marginSmall} 1" sizen="${iconWidth - marginSmall} ${headerHeight}"
             bgcolor="${config.background}" action="${this.id + i + 1}"/>`
      xmltext += centeredText(e.toString(), iconWidth, headerHeight, {
        xOffset: iconWidth * i - marginSmall,
        yOffset: headerHeight + marginSmall
      })
    }
    this.xml = `
      <manialink id="${this.id}">
        <frame posn="${this.positionX} ${this.positionY} 1">
          <format textsize="1"/>
          ${this.header.constructXml(config.title, config.icon, this.side)}
          ${xmltext}
          ${boxXML}
        </frame>
      </manialink>`
  }

}
