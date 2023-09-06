/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, StaticComponent } from '../../UI.js'
import config from './RankWidgetResult.config.js'

export default class RankWidgetResult extends StaticComponent {

  private xml: string = ''

  constructor() {
    super(componentIds.rankResult)
    this.constructXml()
  }

  getHeight(): number {
    return config.height
  }

  display() {
    if (!this.isDisplayed) { return }
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  protected onPositionChange(): void {
    this.constructXml()
    const xml = this.display()
    if (xml !== undefined) { tm.sendManialink(xml) }
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
