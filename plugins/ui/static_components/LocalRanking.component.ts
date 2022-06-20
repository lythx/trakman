import {CONFIG as CFG, IDS } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

//TODO USE 3 COLUMN GRID INSTEAD OF FOR LOOP HERE

export default class LocalRanking extends StaticComponent {

  constructor() {
    super(IDS.LocalRanking, 'race')
    TM.addListener('Controller.PlayerRecord', () => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      if (TM.localRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo) => {
      if (TM.localRecords.some(a => a.login === info.login)) { this.display() }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    const side: boolean = (CFG.localRecordsWidget.posX < 0) ? true : false // Right/Left
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

  private getWidgetContent(login: string): string {
    const titleWidth = CFG.localRecordsWidget.width - 0.8
    const side: boolean = (CFG.localRecordsWidget.posX < 0) ? true : false // Right/Left
    let xml = `<frame posn="0 -3 10">`
    const playerLocal = TM.localRecords.find(a => a.login === login)
    const playerLocalIndex = playerLocal !== undefined ? TM.localRecords.indexOf(playerLocal) : Infinity
    let personalStart = playerLocalIndex > TM.localRecords.length - Math.ceil((CFG.localRecordsWidget.entries - CFG.localRecordsWidget.topCount) / 2) ?
      TM.localRecords.length - (CFG.localRecordsWidget.entries - CFG.localRecordsWidget.topCount) :
      playerLocalIndex - Math.floor((CFG.localRecordsWidget.entries - CFG.localRecordsWidget.topCount) / 2)
    if (playerLocalIndex === Infinity) { personalStart++ }
    let displayIndex = 0 // Display index is number of records that were displayed
    for (const [i, p] of TM.localRecords.entries()) {
      if (i >= CFG.localRecordsWidget.topCount && i < personalStart)
        continue
      const textColour = this.getTextColour(i, playerLocalIndex)
      xml += // Record in XML
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * displayIndex} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}${i + 1}."/>
        <label posn="5.9 ${-1.8 * displayIndex} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${textColour}" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(p.score)}"/>
        <label posn="6.1 ${(-1.8 * displayIndex) + 0.05} 0.04" sizen="${CFG.localRecordsWidget.width - 5.7} 1.7" scale="0.9" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.strip(TM.safeString(p.nickName), false)}"/>`
      // Indicate online players
      if (TM.getPlayer(p.login) !== undefined) { // Amount of records is bigger than max top entries (nullcheck)
        if (i >= CFG.localRecordsWidget.topCount) { // If this entry is inside the top records dont't add background shade as it would be doubled
          xml += // Add line indicating player position
            `<quad posn="0.4 ${-1.8 * displayIndex + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
             style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
        }
        xml += // Add marker
          `<quad posn="${side ? 15.4 : -1.9} ${-1.8 * displayIndex + 0.3} 0.04" sizen="2 2" 
           style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>
          <quad posn="${side ? 15.6 : -1.7} ${-1.8 * displayIndex + 0.1} 0.05" sizen="1.6 1.6" `
        if (i < playerLocalIndex) { // Player faster than your record
          xml += `style="Icons128x128_1" substyle="ChallengeAuthor"/>`
        } else if (i > playerLocalIndex) { // Player slower than your record
          xml += `style="Icons128x128_1" substyle="Solo"/>`
        } else { // Your record
          xml += `style="Icons64x64_1" substyle="${side ? 'ArrowPrev' : 'ArrowNext'}"/>`
        }
      }
      displayIndex++
      if (displayIndex === CFG.localRecordsWidget.entries || (playerLocalIndex === Infinity && displayIndex === CFG.localRecordsWidget.entries - 1)) {
        break // Break if theres max entries, leave one entry empty if player doesn't have a record
      }
    }
    // Add empty entry at end if player has no record
    if (playerLocalIndex === Infinity) {
      const p = TM.getPlayer(login)
      if (p === undefined) { // VERY unlikely to happen
        TM.error(`Cannot find player ${login} in memory.`)
        return `<frame posn="0 -3 10"></frame>`
      }
      // If this entry is inside the top records dont't add background shade as it would be doubled
      const background = TM.localRecords.length < CFG.localRecordsWidget.topCount + 1 ? '' :
        `<quad posn="0.4 ${-1.8 * displayIndex + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
         style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
      xml +=
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * displayIndex} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}--."/>
        <label posn="5.9 ${-1.8 * displayIndex} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${CFG.widgetStyleRace.colours.self}" text="${CFG.widgetStyleRace.formattingCodes}-:--.--"/>
        <label posn="6.1 ${(-1.8 * displayIndex) + 0.05} 0.04" sizen="${CFG.localRecordsWidget.width - 5.7} 1.7" scale="0.9" 
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
  private getTextColour(localIndex: number, playerLocalIndex: number): string {
    if (localIndex < playerLocalIndex) { // Player faster than your record
      if (localIndex >= CFG.localRecordsWidget.topCount) {
        return CFG.widgetStyleRace.colours.better
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else if (localIndex > playerLocalIndex) { // Player slower than your record
      if (localIndex >= CFG.localRecordsWidget.topCount) {
        return CFG.widgetStyleRace.colours.worse
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else { // Your record 
      return CFG.widgetStyleRace.colours.self
    }
  }

}
