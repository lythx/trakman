/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, StaticComponent } from '../../UI.js'
import config from './TimerWidgetResult.config.js'

export default class TimerWidgetResult extends StaticComponent {

  private xml: string = ''

  constructor() {
    super(componentIds.timerResult, 'result')
    this.constructXml()
  }

  display(): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
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
