import { CONFIG as CFG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class DayTime extends StaticComponent {

  private timeString: string

  constructor() {
    super(IDS.DayTime, 'race')
    this.timeString = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`
    setInterval(() => {
      const timeString = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`
      if (this._isDisplayed && this.timeString !== timeString) {
        this.timeString = timeString
        this.display()
      }
    }, 1000)
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="-64.7 37.65 10">
        <quad posn="0 0 1" sizen="15.5 4.5" action="100"
         style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
        <label posn="2.9 -0.45 2" sizen="14 2" style="TextRaceChrono" scale="0.7" text="${CFG.widgetStyleRace.formattingCodes}${this.timeString}"/>
      </frame>
    </manialink>`
    )
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="-64.7 37.65 10">
        <quad posn="0 0 1" sizen="15.5 4.5" 
         style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
        <label posn="2.9 -0.45 2" sizen="14 2" style="TextRaceChrono" scale="0.7" text="${CFG.widgetStyleRace.formattingCodes}${this.timeString}"/>
      </frame>
    </manialink>`
      , login)
  }

}
