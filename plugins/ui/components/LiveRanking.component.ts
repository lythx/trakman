import CFG from '../UIConfig.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import IStaticComponent from './StaticComponent.interface.js'
import StaticComponent from './StaticComponent.js'

export default class LiveRanking extends StaticComponent implements IStaticComponent {

  constructor(id: number) {
    super('race', id)
  }

  display(): void {
    this._isDisplayed = true
    const side: boolean = (CFG.liveRankingsWidget.posX < 0) ? true : false
    TM.sendManialink(
      `<manialink id="${this.id}">
        <frame posn="${CFG.liveRankingsWidget.posX} ${CFG.liveRankingsWidget.posY} 10">
          <quad posn="0 0 0.01" sizen="${CFG.liveRankingsWidget.width} ${1.8 * CFG.liveRankingsWidget.entries + 3.3}" 
           action="50003" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
          <quad posn="0.4 -0.36 0.02" sizen="${StaticComponent.titleWidth} 2" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/> 
          <quad posn="${side ? 12.5 + CFG.liveRankingsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" 
           style="${CFG.liveRankingsWidget.iconStyle}" substyle="${CFG.liveRankingsWidget.iconSubStyle}"/>
          <label posn="${side ? 12.4 + CFG.liveRankingsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" 
           halign="${side ? 'right' : 'left'}" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + CFG.liveRankingsWidget.title}"/> 
          <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        </frame>
      </manialink>`
    )
  }

  displayToPlayer(login: string): void { //LIVE RECORD TABLE NOT IMPLEMENTED YET
    const side: boolean = (CFG.liveRankingsWidget.posX < 0) ? true : false
    TM.sendManialink(
      `<manialink id="${this.id}">
        <frame posn="${CFG.liveRankingsWidget.posX} ${CFG.liveRankingsWidget.posY} 10">
          <quad posn="0 0 0.01" sizen="${CFG.liveRankingsWidget.width} ${1.8 * CFG.liveRankingsWidget.entries + 3.3}" 
           action="50003" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
          <quad posn="0.4 -0.36 0.02" sizen="${StaticComponent.titleWidth} 2" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/> 
          <quad posn="${side ? 12.5 + CFG.liveRankingsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" 
           style="${CFG.liveRankingsWidget.iconStyle}" substyle="${CFG.liveRankingsWidget.iconSubStyle}"/>
          <label posn="${side ? 12.4 + CFG.liveRankingsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" 
           halign="${side ? 'right' : 'left'}" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + CFG.liveRankingsWidget.title}"/> 
          <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        </frame>
      </manialink>`,
      login)
  }

}




