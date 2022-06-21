import { CONFIG as CFG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class KarmaWidget extends StaticComponent {

  private xml =
    `<manialink id="${this.id}">
      <frame posn="49.2 32.8 10">
        <quad posn="0 0 0.01" sizen="15.76 10.65" 
         action="50004" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
        <quad posn="0.4 -0.36 0.02" sizen="${StaticComponent.titleWidth} 2" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/> 
        <quad posn="0.6 0 0.04" sizen="2.5 2.5" 
         style="Icons64x64_1" substyle="ToolLeague1"/>
        <label posn="3.2 -0.55 0.04" sizen="10.2 0" 
         halign="left" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + 'Votes'}"/> 
      <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
    </frame>
  </manialink>`

  constructor() {
    super(IDS.KarmaWidget, 'race')
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

}

