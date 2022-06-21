import { CONFIG as CFG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class SpectatorWidget extends StaticComponent {

  private xml =
    `<manialink id="${this.id}">
      <frame posn="-64.7 28.85 10">
        <quad posn="0 0 0.01" sizen="15.5 5.25"
         action="50007" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
      </frame>
    </manialink>`

  constructor() {
    super(IDS.SpectatorWidget, 'race')
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

}

