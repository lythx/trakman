import CFG from '../UIConfig.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import IStaticComponent from './StaticComponent.interface.js'
import StaticComponent from './StaticComponent.js'

export default class DediRanking extends StaticComponent implements IStaticComponent {

  constructor(id: number) {
    super('race', id)
    TM.addListener('Controller.DedimaniaRecords', () => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      if (TM.dediRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo) => {
      if (TM.dediRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.DedimaniaRecord', () => {
      this.display()
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    const side: boolean = (CFG.dediRecordsWidget.posX < 0) ? true : false // Right/Left
    const widgetHeight = 1.8 * CFG.dediRecordsWidget.entries + 3.3
    const columnHeight = widgetHeight - 3.1
    const columnWidth = CFG.dediRecordsWidget.width - 6.45
    const content = this.getWidgetContent(login)
    TM.sendManialink(
      `<manialink id="${this.id}">
        <frame posn="${CFG.dediRecordsWidget.posX} ${CFG.dediRecordsWidget.posY} 10">
          <quad posn="0 0 0.01" sizen="${CFG.dediRecordsWidget.width} ${widgetHeight}" 
           action="50002" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/> 
          ${content}
          <quad posn="0.4 -2.6 0.02" sizen="2 ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgRank}"/> 
          <quad posn="2.4 -2.6 0.02" sizen="3.65 ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgScore}"/> 
          <quad posn="6.05 -2.6 0.02" sizen="${columnWidth} ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgName}"/> 
          <quad posn="0.4 -0.36 0.02" sizen="${StaticComponent.titleWidth} 2" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/> 
          <quad posn="${side ? 12.5 + CFG.dediRecordsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" 
           style="${CFG.dediRecordsWidget.iconStyle}" substyle="${CFG.dediRecordsWidget.iconSubStyle}"/>
          <label posn="${side ? 12.4 + CFG.dediRecordsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" 
           halign="${side ? 'right' : 'left'}" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + CFG.dediRecordsWidget.title}"/> 
          <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
          <quad posn="0.4 -2.6 0.03" sizen="${StaticComponent.titleWidth} ${1.8 * CFG.dediRecordsWidget.topCount + 0.3}" 
           style="${CFG.widgetStyleRace.topStyle}" substyle="${CFG.widgetStyleRace.topSubStyle}"/>
        </frame>
      </manialink>`,
      login
    )
  }

  private getWidgetContent(login: string): string {
    const titleWidth = CFG.dediRecordsWidget.width - 0.8
    const side: boolean = (CFG.dediRecordsWidget.posX < 0) ? true : false // Right/Left
    let xml = `<frame posn="0 -3 10">`
    const playerDedi = TM.dediRecords.find(a => a.login === login)
    const playerDediIndex = playerDedi !== undefined ? TM.dediRecords.indexOf(playerDedi) : Infinity
    let personalStart = playerDediIndex > TM.dediRecords.length - Math.ceil((CFG.dediRecordsWidget.entries - CFG.dediRecordsWidget.topCount) / 2) ?
      TM.dediRecords.length - (CFG.dediRecordsWidget.entries - CFG.dediRecordsWidget.topCount) :
      playerDediIndex - Math.floor((CFG.dediRecordsWidget.entries - CFG.dediRecordsWidget.topCount) / 2)
    if (playerDediIndex === Infinity) { personalStart++ }
    let displayIndex = 0 // Display index is number of records that were displayed
    for (const [i, p] of TM.dediRecords.entries()) {
      if (i >= CFG.dediRecordsWidget.topCount && i < personalStart)
        continue
      const textColour = this.getTextColour(i, playerDediIndex)
      xml += // Record in XML
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * displayIndex} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}${i + 1}."/>
        <label posn="5.9 ${-1.8 * displayIndex} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${textColour}" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(p.score)}"/>
        <label posn="6.1 ${(-1.8 * displayIndex) + 0.05} 0.04" sizen="${CFG.dediRecordsWidget.width - 5.7} 1.7" scale="0.9" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.strip(TM.safeString(p.nickName), false)}"/>`
      // Indicate online players
      if (TM.getPlayer(p.login) !== undefined) { // Amount of records is bigger than max top entries (nullcheck)
        if (i > CFG.dediRecordsWidget.topCount) { // If this entry is inside the top records dont't add background shade as it would be doubled
          xml += // Add line indicating player position
            `<quad posn="0.4 ${-1.8 * displayIndex + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
             style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
        }
        xml += // Add marker
          `<quad posn="${side ? 15.4 : -1.9} ${-1.8 * displayIndex + 0.3} 0.04" sizen="2 2" 
           style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>
          <quad posn="${side ? 15.6 : -1.7} ${-1.8 * displayIndex + 0.1} 0.05" sizen="1.6 1.6" `
        if (i < playerDediIndex) { // Player faster than your record
          xml += `style="Icons128x128_1" substyle="ChallengeAuthor"/>`
        } else if (i > playerDediIndex) { // Player slower than your record
          xml += `style="Icons128x128_1" substyle="Solo"/>`
        } else { // Your record
          xml += `style="Icons64x64_1" substyle="${side ? 'ArrowPrev' : 'ArrowNext'}"/>`
        }
      }
      displayIndex++
      if (displayIndex === CFG.dediRecordsWidget.entries || (playerDediIndex === Infinity && displayIndex === CFG.dediRecordsWidget.entries - 1)) {
        break // Break if theres max entries, leave one entry empty if player doesn't have a record
      }
    }
    // Add empty entry at end if player has no record
    if (playerDediIndex === Infinity) {
      const p = TM.getPlayer(login)
      if (p === undefined) { // VERY unlikely to happen
        TM.error(`Cannot find player ${login} in memory.`)
        return `<frame posn="0 -3 10"></frame>`
      }
      // If this entry is inside the top records dont't add background shade as it would be doubled
      const background = TM.dediRecords.length < CFG.dediRecordsWidget.topCount + 1 ? '' :
        `<quad posn="0.4 ${-1.8 * displayIndex + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
         style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
      xml +=
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * displayIndex} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}--."/>
        <label posn="5.9 ${-1.8 * displayIndex} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${CFG.widgetStyleRace.colours.self}" text="${CFG.widgetStyleRace.formattingCodes}-:--.--"/>
        <label posn="6.1 ${(-1.8 * displayIndex) + 0.05} 0.04" sizen="${CFG.dediRecordsWidget.width - 5.7} 1.7" scale="0.9" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.strip(TM.safeString(p?.nickName), false)}"/>
        ${background}
        <quad posn="${side ? 15.4 : -1.9} ${-1.8 * displayIndex + 0.3} 0.04" sizen="2 2" 
         style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>
        <quad posn="${side ? 15.6 : -1.7} ${-1.8 * displayIndex + 0.1} 0.05" sizen="1.6 1.6" style="Icons64x64_1" substyle="${side ? 'ArrowPrev' : 'ArrowNext'}"/>`
    }
    xml += '</frame>'
    return xml
  }

  /**
   * Get time color depending on position
   */
  private getTextColour(dediIndex: number, playerDediIndex: number): string {
    if (dediIndex < playerDediIndex) { // Player faster than your record
      if (dediIndex >= CFG.dediRecordsWidget.topCount) {
        return CFG.widgetStyleRace.colours.better
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else if (dediIndex > playerDediIndex) { // Player slower than your record
      if (dediIndex >= CFG.dediRecordsWidget.topCount) {
        return CFG.widgetStyleRace.colours.worse
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else { // Your record 
      return CFG.widgetStyleRace.colours.self
    }
  }

}
