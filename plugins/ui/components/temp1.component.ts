import CFG from '../UIConfig.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import IStaticComponent from './StaticComponent.interface.js'
import StaticComponent from './StaticComponent.js'

export default class temp1 extends StaticComponent implements IStaticComponent {

  private xml =      // RANDOM ASS WINDOW FOR REFERENCE ID (autistic flexi)
    `<manialink id="${this.id}">
      <frame posn="-64.7 37.65 10">
        <quad posn="0 0 0.01" sizen="15.5 4.5"
         action="50009" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
      </frame>
    </manialink>`

  constructor(id: number) {
    super('race', id)
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

}
