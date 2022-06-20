import { CONFIG as CFG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class temp1 extends StaticComponent {

  private xml =      // RANDOM ASS WINDOW FOR REFERENCE ID (autistic flexi)
    `<manialink id="${this.id}">
      <frame posn="-64.7 48 10">
        <quad posn="0 0 0.01" sizen="15.5 10.5"
         action="50009" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
      </frame>
    </manialink>`

  constructor() {
    super(IDS.temp1, 'race')
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

}
