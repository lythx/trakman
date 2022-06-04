import CFG from '../UIConfig.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import IStaticComponent from './StaticComponent.interface.js'
import StaticComponent from './StaticComponent.js'

export default class LocalRanking extends StaticComponent implements IStaticComponent {

  constructor(id: number) {
    super('race', id)
    TM.addListener('Controller.PlayerRecord', () => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      if (TM.topPlayers.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo) => {
      if (TM.topPlayers.some(a => a.login === info.login)) { this.display() }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    const side: boolean = (CFG.localRecordsWidget.posX < 0) ? true : false
    const widgetHeight = 1.8 * CFG.localRecordsWidget.entries + 3.3
    const columnHeight = widgetHeight - 3.1
    const columnWidth = CFG.localRecordsWidget.width - 6.45
    const content = this.getWidgetContent(login)
    TM.sendManialink(
      `<manialink id="${this.id}">
        <frame posn="${CFG.localRecordsWidget.posX} ${CFG.localRecordsWidget.posY} 10">
          <quad posn="0 0 0.01" sizen="${CFG.localRecordsWidget.width} ${widgetHeight}" 
           action="50001" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/> 
          ${content}
          <quad posn="0.4 -2.6 0.02" sizen="2 ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgRank}"/> 
          <quad posn="2.4 -2.6 0.02" sizen="3.65 ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgScore}"/> 
          <quad posn="6.05 -2.6 0.02" sizen="${columnWidth} ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgName}"/> 
          <quad posn="0.4 -0.36 0.02" sizen="${StaticComponent.titleWidth} 2" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/> 
          <quad posn="${side ? 12.5 + CFG.localRecordsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" 
           style="${CFG.localRecordsWidget.iconStyle}" substyle="${CFG.localRecordsWidget.iconSubStyle}"/>
          <label posn="${side ? 12.4 + CFG.localRecordsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" 
           halign="${side ? 'right' : 'left'}" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + CFG.localRecordsWidget.title}"/> 
          <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
          <quad posn="0.4 -2.6 0.03" sizen="${StaticComponent.titleWidth} ${1.8 * CFG.localRecordsWidget.topCount + 0.3}" 
           style="${CFG.widgetStyleRace.topStyle}" substyle="${CFG.widgetStyleRace.topSubStyle}"/>
        </frame>
      </manialink>`,
      login
    )
  }

  private getWidgetContent(login: string) {
    let xml = `<frame posn="0 -3 10">`
    for (const [i, p] of TM.topPlayers.entries()) {
      xml += // Records list in XML
        `<label posn="1 ${-1.8 * i} 0.04" sizen="1 0" halign="left" textsize="1" 
         text="${CFG.widgetStyleRace.formattingCodes}${i + 1}."/>
        <label posn="2.485 ${-1.8 * i} 0.04" sizen="3.5 0" halign="left" textsize="1" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(p.score)}"/>
        <label posn="6.45 ${(-1.8 * i) + 0.05} 0.04" sizen="7.5 0" halign="left" textsize="1" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.strip(p.nickName, false)}"/>`
      // Display an arrow next to active player (but not self)
      if (TM.getPlayer(p.login) !== undefined) {
        xml += `<quad posn="-1.9 ${-1.8 * i} 0.04" sizen="2 2" `
        if (p.login !== login) {
          xml +=
            `style="${CFG.widgetStyleRace.hlOtherStyle}" substyle="${CFG.widgetStyleRace.hlOtherSubStyle}"/>
            <quad posn="-1.7 ${-1.8 * i - 0.2} 0.05" sizen="1.6 1.6" style="Icons128x128_1" substyle="Solo"/>`
        } else {
          xml +=
            `style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>
            <quad posn="-1.7 ${-1.8 * i - 0.2} 0.05" sizen="1.6 1.6" style="Icons64x64_1" substyle="ArrowNext"/>`
        }
      }
    }
    xml += '</frame>'
    return xml
  }

}
