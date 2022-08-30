import { IDS } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import config from './RankWidget.config.js'

export default class RankWidget extends StaticComponent {

  private readonly positionY: number
  private readonly positionX: number
  private xml: string = ''

  constructor() {
    super(IDS.rank, 'race')
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
    // Z posn is set to -37 because the rank text is at around -36 
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -37">
        <quad posn="0 0 0" sizen="${config.width} ${config.height}" bgcolor="${config.background}"/>
      </frame>
    </manialink>`
  }

}

