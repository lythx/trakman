
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

    private xml: string = ''

    constructor() {
        super(IDS.liveCheckpoint, 'race')
        this.positionY = calculateStaticPositionY('donationPanel')
        this.constructXML()
    }

    display(): void {
        this._isDisplayed = true
        for(const player of TM.players){
            this.displayToPlayer(player.login)
        }
        
    }

    displayToPlayer(login: string): void | Promise<void> {
        TM.sendManialink(this.xml, login)
    }

    private constructXML(): void {
        const headerHeight: number = CONFIG.staticHeader.height
        const amount = CONFIG.donationPanel.amount
        const marginSmall: number = CONFIG.static.marginSmall
        const iconWidth: number = this.width / amount.length
        const iconUrl = stringToObjectProperty(this.icon, ICONS)
        let boxXML: string = ''
        let xmltext: string = ''
        for(const [i] of amount.entries()) {
            boxXML += `
            <quad posn="${iconWidth * i} -${CONFIG.staticHeader.height + marginSmall} 1" sizen="${iconWidth - marginSmall} ${headerHeight}" bgcolor="${CONFIG.static.bgColor}"/>`
            xmltext +=`
            ${centeredText(amount.join().split(',')[i], iconWidth, headerHeight, {xOffset: iconWidth*i-0.1, yOffset: headerHeight+marginSmall, padding: -1})}`
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