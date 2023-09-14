/**
 * @author lythx
 * @since 0.1
 */

import { componentIds, StaticComponent } from '../../UI.js'
import config from './PreviousAndBest.config.js'

export default class PreviousAndBest extends StaticComponent {

  private xml: string = ''

  constructor() {
    super(componentIds.previousAndBest)
    this.constructXml()
  }

  getHeight(): number {
    return config.height
  }

  protected onPositionChange(): void {
    this.constructXml()
    this.sendMultipleManialinks(this.display())
  }

  display() {
    if (!this.isDisplayed) { return }
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  private constructXml(): void {
    // Z posn is set to -37 because the previous best text is at around -36 
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -37">
        <quad posn="0 0 0" sizen="${config.width} ${config.height}" bgcolor="${config.background}"/>
      </frame>
    </manialink>`
  }

}
