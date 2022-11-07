import { componentIds, StaticComponent } from '../../UI.js'
import config from './RankWidgetResult.config.js'

export default class RankWidgetResult extends StaticComponent {

    private readonly positionX: number
    private readonly positionY: number
    private xml: string = ''

    constructor() {
        super(componentIds.rankResult, 'result')
        const pos = this.getRelativePosition()
        this.positionX = pos.x
        this.positionY = pos.y
        this.constructXml()
    }

    display(): void {
        if (this.isDisplayed === false) { return }
        tm.sendManialink(this.xml)
    }

    displayToPlayer(login: string): void {
        if (this.isDisplayed === false) { return }
        tm.sendManialink(this.xml, login)
    }

    private constructXml(): void {
        this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/>
        <quad posn="0 0 1" sizen="${config.width} ${config.height}" bgcolor="${config.background}"/>
      </frame>
    </manialink>`
    }

}
