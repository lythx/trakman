import CFG from '../UIConfig.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import IStaticComponent from './StaticComponent.interface.js'
import StaticComponent from './StaticComponent.js'

export default class LiveRanking extends StaticComponent implements IStaticComponent {

  constructor(id: number) {
    super('race', id)
    TM.addListener('Controller.LiveRecord', (info: RecordInfo) => {
      if (info) { this.display() }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    const side: boolean = (CFG.liveRankingsWidget.posX < 0) ? true : false
    const widgetHeight = 1.8 * CFG.liveRankingsWidget.entries + 3.3
    const columnHeight = widgetHeight - 3.1
    const columnWidth = CFG.liveRankingsWidget.width - 6.45
    const content = this.getWidgetContent(login)
    TM.sendManialink(
      `<manialink id="${this.id}">
        <frame posn="${CFG.liveRankingsWidget.posX} ${CFG.liveRankingsWidget.posY} 10">
          <quad posn="0 0 0.01" sizen="${CFG.liveRankingsWidget.width} ${widgetHeight}" 
           action="50003" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/> 
          ${content}
          <quad posn="0.4 -2.6 0.02" sizen="2 ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgRank}"/> 
          <quad posn="2.4 -2.6 0.02" sizen="3.65 ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgScore}"/> 
          <quad posn="6.05 -2.6 0.02" sizen="${columnWidth} ${columnHeight}" bgcolor="${CFG.widgetStyleRace.colours.bgName}"/> 
          <quad posn="0.4 -0.36 0.02" sizen="${StaticComponent.titleWidth} 2" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/> 
          <quad posn="${side ? 12.5 + CFG.liveRankingsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" 
           style="${CFG.liveRankingsWidget.iconStyle}" substyle="${CFG.liveRankingsWidget.iconSubStyle}"/>
          <label posn="${side ? 12.4 + CFG.liveRankingsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" 
           halign="${side ? 'right' : 'left'}" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + CFG.liveRankingsWidget.title}"/> 
          <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
          <quad posn="0.4 -2.6 0.03" sizen="${StaticComponent.titleWidth} ${1.8 * CFG.liveRankingsWidget.topCount + 0.3}" 
           style="${CFG.widgetStyleRace.topStyle}" substyle="${CFG.widgetStyleRace.topSubStyle}"/>
        </frame>
      </manialink>`,
      login
    )
  }

  private getWidgetContent(login: string) {
    const titleWidth = CFG.liveRankingsWidget.width - 0.8
    const side: boolean = (CFG.liveRankingsWidget.posX < 0) ? true : false
    let xml = `<frame posn="0 -3 10">`
    const playerLive = TM.liveRecords.find(a => a.login === login)
    const playerLiveIndex = playerLive !== undefined ? TM.liveRecords.indexOf(playerLive) : Infinity
    let personalStart = playerLiveIndex > TM.liveRecords.length - Math.ceil((CFG.liveRankingsWidget.entries - CFG.liveRankingsWidget.topCount) / 2) ?
      TM.liveRecords.length - (CFG.liveRankingsWidget.entries - CFG.liveRankingsWidget.topCount) :
      playerLiveIndex - Math.floor((CFG.liveRankingsWidget.entries - CFG.liveRankingsWidget.topCount) / 2)
    if (playerLiveIndex === Infinity) { personalStart++ }
    let displayIndex = 0 // Display index is number of records that were displayed
    for (const [i, p] of TM.liveRecords.entries()) {
      if (i >= CFG.liveRankingsWidget.topCount && i < personalStart)
        continue
      const textColour = this.getTextColour(i, playerLiveIndex)
      xml += // Record in XML
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * displayIndex} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}${i + 1}."/>
        <label posn="5.9 ${-1.8 * displayIndex} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${textColour}" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(p.score)}"/>
        <label posn="6.1 ${(-1.8 * displayIndex) + 0.05} 0.04" sizen="${CFG.liveRankingsWidget.width - 5.7} 1.7" scale="0.9" 
         text="${CFG.widgetStyleRace.formattingCodes + TM.strip(TM.safeString(p.nickName), false)}"/>`
      // Indicate online players
      if (TM.getPlayer(p.login) !== undefined) { // Amount of records is bigger than max top entries (nullcheck)
        if (i > CFG.liveRankingsWidget.topCount) { // If this entry is inside the top records dont't add background shade as it would be doubled
          xml += // Add line indicating player position
            `<quad posn="0.4 ${-1.8 * displayIndex + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
             style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
        }
        xml += // Add marker
          `<quad posn="${side ? 15.4 : -1.9} ${-1.8 * displayIndex + 0.3} 0.04" sizen="2 2" 
           style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>
          <quad posn="${side ? 15.6 : -1.7} ${-1.8 * displayIndex + 0.1} 0.05" sizen="1.6 1.6" `
        if (i < playerLiveIndex) { // Player faster than your record
          xml += `style="Icons128x128_1" substyle="ChallengeAuthor"/>`
        } else if (i > playerLiveIndex) { // Player slower than your record
          xml += `style="Icons128x128_1" substyle="Solo"/>`
        } else { // Your record
          xml += `style="Icons64x64_1" substyle="${side ? 'ArrowPrev' : 'ArrowNext'}"/>`
        }
      }
      displayIndex++
      if (displayIndex === CFG.liveRankingsWidget.entries || (playerLiveIndex === Infinity && displayIndex === CFG.liveRankingsWidget.entries - 1)) {
        break // Break if theres max entries, leave one entry empty if player doesn't have a record
      }
    }
    // Add empty entry at end if player has no record
    if (playerLiveIndex === Infinity) {
      const p = TM.getPlayer(login)
      if (p === undefined) { // VERY unlikely to happen
        TM.error(`Cannot find player ${login} in memory.`)
        return `<frame posn="0 -3 10"></frame>`
      }
      // If this entry is inside the top records dont't add background shade as it would be doubled
      const background = TM.liveRecords.length < CFG.liveRankingsWidget.topCount + 1 ? '' :
        `<quad posn="0.4 ${-1.8 * displayIndex + 0.3} 0.03" sizen="${titleWidth} ${1.8 + 0.3}" 
         style="${CFG.widgetStyleRace.hlSelfStyle}" substyle="${CFG.widgetStyleRace.hlSelfSubStyle}"/>`
      xml +=
        `<format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
        <label posn="2.3 ${-1.8 * displayIndex} 0.04" sizen="1.7 1.7" scale="0.9" halign="right" 
         text="${CFG.widgetStyleRace.formattingCodes}--."/>
        <label posn="5.9 ${-1.8 * displayIndex} 0.04" sizen="3.8 1.7" scale="0.9" halign="right" 
         textcolor="${CFG.widgetStyleRace.colours.self}" text="${CFG.widgetStyleRace.formattingCodes}-:--.--"/>
        <label posn="6.1 ${(-1.8 * displayIndex) + 0.05} 0.04" sizen="${CFG.liveRankingsWidget.width - 5.7} 1.7" scale="0.9" 
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
  private getTextColour(liveIndex: number, playerLiveIndex: number): string {
    if (liveIndex < playerLiveIndex) { // Player faster than your record
      if (liveIndex >= CFG.liveRankingsWidget.topCount) {
        return CFG.widgetStyleRace.colours.better
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else if (liveIndex > playerLiveIndex) { // Player slower than your record
      if (liveIndex >= CFG.liveRankingsWidget.topCount) {
        return CFG.widgetStyleRace.colours.worse
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else { // Your record 
      return CFG.widgetStyleRace.colours.self
    }
  }

}




