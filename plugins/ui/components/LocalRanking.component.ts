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
    const titleWidth = CFG.localRecordsWidget.width - 0.8
    const side: boolean = (CFG.localRecordsWidget.posX < 0) ? true : false
    let xml = `<frame posn="0 -3 10">`
    let textColour: string
    const pr = TM.topPlayers.find(a => a.login === login)
    const prIndex = pr !== undefined ? TM.topPlayers.indexOf(pr) : Infinity
    for (const [i, p] of TM.topPlayers.entries()) {
      if (i < prIndex) {
        if (i >= CFG.localRecordsWidget.topCount) {
          textColour = CFG.widgetStyleRace.colours.better
        } else {
          textColour = CFG.widgetStyleRace.colours.top
        }
      } else if (i > prIndex) {
        if (i >= CFG.localRecordsWidget.topCount) {
          textColour = CFG.widgetStyleRace.colours.worse
        } else {
          textColour = CFG.widgetStyleRace.colours.top
        }
      } else {
        textColour = CFG.widgetStyleRace.colours.self
      }
      xml += // Records list in XML
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * i} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}${i + 1}."/>
        <label posn="5.9 ${-1.8 * i} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${textColour}" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(p.score)}"/>
        <label posn="6.1 ${(-1.8 * i) + 0.05} 0.04" sizen="${CFG.localRecordsWidget.width - 5.7} 1.7" scale="0.9" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.strip(TM.safeString(p.nickName), false)}"/>`
      // Indicate online players
      if (TM.getPlayer(p.login) !== undefined) {
        // Amount of records is bigger than max top entries (nullcheck)
        if (i > CFG.localRecordsWidget.topCount) {
          // Player's record is slower than the worst top entry
          // Add line indicating player position
          xml +=
            `<quad posn="0.4 ${-1.8 * i + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
             style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
        }
        // Add marker
        xml +=
          `<quad posn="${side ? 15.4 : -1.9} ${-1.8 * i + 0.3} 0.04" sizen="2 2" 
           style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>
          <quad posn="${side ? 15.6 : -1.7} ${-1.8 * i + 0.1} 0.05" sizen="1.6 1.6" `
        if (i < prIndex) {
          xml += `style="Icons128x128_1" substyle="ChallengeAuthor"/>`
        } else if (i > prIndex) {
          xml += `style="Icons128x128_1" substyle="Solo"/>`
        } else {
          xml += `style="Icons64x64_1" substyle="${side ? 'ArrowPrev' : 'ArrowNext'}"/>`
        }
      }
      // Add no record thing if no record from player
      if (i === CFG.localRecordsWidget.entries - 1) {
        break
      }
    }
    xml += '</frame>'
    return xml
  }

}
