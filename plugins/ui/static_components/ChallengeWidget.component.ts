import CFG from '../UIConfig.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import IStaticComponent from './StaticComponent.interface.js'
import StaticComponent from './StaticComponent.js'

export default class ChallengeWidget extends StaticComponent implements IStaticComponent {

  private xml: string = ''

  constructor(id: number) {
    super('race', id)
  }

  display(): void {
    this._isDisplayed = true
    this.updateXML().then(() => {
      TM.sendManialink(this.xml)
    })
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private async updateXML(): Promise<void> {
    let author
    const authorLogin = TM.challenge.author
    if (process.env.USE_WEBSERVICES === "YES" && authorLogin.match(/[\da - z_ +.-]/)) {
      const json = await TM.fetchWebServices(authorLogin)
      if (json instanceof Error) {
        TM.error(`Failed to fetch nickname for author login ${authorLogin}`, json.message)
        author = authorLogin
      }
      else {
        author = json.nickname
      }
    }
    else {
      author = authorLogin
    }

    let tmxInfo = ``
    if (process.env.USE_TMX === "YES") {
      const tmxTrackInfo = await TM.fetchTMXTrackInfo(TM.challenge.id)
      if (!(tmxTrackInfo instanceof Error)) {
        tmxTrackInfo
        tmxInfo += `
          <quad posn="6 -6.25 0.04" sizen="1.5 1.7" image="https://cdn.discordapp.com/attachments/552460149957197845/986417064912777327/build.png"/>
          <label posn="7.6 -6.55 0.04" sizen="6 2" scale="0.75" text="${CFG.widgetStyleRace.formattingCodes + tmxTrackInfo.lastUpdateDate.getFullYear()}/${(tmxTrackInfo.lastUpdateDate.getMonth() + 1).toString().padStart(2, '0')}"/>
          <quad posn="11.3 -6.25 0.04" sizen="1.6 1.6" style="Icons64x64_1" substyle="OfficialRace"/>
          <label posn="12.9 -6.55 0.04" sizen="1.9 2" scale="0.75" text="${CFG.widgetStyleRace.formattingCodes + tmxTrackInfo.awards}"/>`
      }
    }

    const side: boolean = (CFG.challengeWidget.racePos.posX < 0) ? true : false
    this.xml =
      `<manialink id="${this.id}">
        <frame posn="${CFG.challengeWidget.racePos.posX} ${CFG.challengeWidget.racePos.posY} 10">
          <format textsize="1" textcolor="${CFG.widgetStyleRace.colours.default}"/>
          <quad posn="0 0 0.01" sizen="${CFG.challengeWidget.width} ${CFG.challengeWidget.height}" 
           action="1000" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
          <quad posn="0.4 -0.36 0.02" sizen="${CFG.challengeWidget.width - 0.8} 2" 
           style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>
          <quad posn="${side ? 12.5 + CFG.challengeWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" 
           style="${CFG.challengeWidget.icons.currTrack.style}" substyle="${CFG.challengeWidget.icons.currTrack.subStyle}"/>
          <label posn="${side ? 12.4 + CFG.challengeWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" 
           halign="${side ? 'right' : 'left'}" textsize="1" text="${CFG.widgetStyleRace.formattingCodes + CFG.challengeWidget.titles.currTrack}"/>
          <label posn="1 -2.7 0.04" sizen="13.55 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.strip(TM.challenge.name, false)}"/>
          <label posn="1 -4.5 0.04" sizen="14.85 2" scale="0.9" text="${CFG.widgetStyleRace.formattingCodes}by ${TM.strip(author, false)}"/>
          <quad posn="0.6 -6.22 0.04" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>
          <label posn="2.35 -6.55 0.04" sizen="4.6 2" scale="0.75" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(TM.challenge.authorTime)}"/>
          ${tmxInfo}
        </frame>
      </manialink>`
  }

}
