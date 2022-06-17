import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import CFG from '../UIConfig.json' assert { type: 'json' }
import Paginator from "../Paginator.js";

interface PlayerPage {
  readonly login: string
  page: number
}

export default class TMXWidget extends PopupWindow implements IPopupWindow {

  private readonly itemsPerPage = 3
  private readonly queueMapsCount = 4
  private readonly previousMapsCount = 4
  private readonly playerPages: PlayerPage[] = []
  private readonly paginator: Paginator

  constructor(openId: number, closeId: number) {
    super(openId, closeId, 56)
    this.paginator = new Paginator(openId, closeId, Math.ceil(1 + this.queueMapsCount / this.itemsPerPage))
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.id + 1 && info.answer <= this.id + 6) {
        const playerPage = this.playerPages.find(a => a.login === info.login)
        if (playerPage === undefined) {
          TM.error(`Can't find player ${info.login} in memory`)
          return
        }
        const prevCount = Math.ceil((Math.min(this.previousMapsCount, TM.previousChallenges.length) - 1) / this.itemsPerPage)
        const nextCount = Math.ceil((this.queueMapsCount - 1) / this.itemsPerPage)
        this.paginator.updatePageCount(prevCount + 1 + nextCount)
        playerPage.page = this.paginator.getPageFromClick(info.answer, playerPage.page)
        this.displayToPlayer(info.login)
      }
    })
  }

  constructContent(login: string): string {
    const challenges = TM.challenges
    challenges.sort((a, b) => a.author.localeCompare(b.author))
    let xml = ''
    const titles = [CFG.challengeWidget.titles.lastTrack, CFG.challengeWidget.titles.currTrack, CFG.challengeWidget.titles.nextTrack]
    const prevCount = Math.ceil((Math.min(this.previousMapsCount, TM.previousChallenges.length) - 1) / this.itemsPerPage)
    let page = 1 + prevCount
    const playerPage = this.playerPages.find(a => a.login === login)
    if (playerPage !== undefined) { page = playerPage.page }
    else { this.playerPages.push({ login, page }) }
    const pages = [
      [TM.previousChallenges[3], TM.previousChallenges[2], TM.previousChallenges[1]],
      [TM.previousChallenges[0], TM.challenge, TM.challengeQueue[0]],
      [TM.challengeQueue[1], TM.challengeQueue[2], TM.challengeQueue[3]]
    ]
    const TMXPages = [
      [TM.TMXPrevious[3], TM.TMXPrevious[2], TM.TMXPrevious[1]],
      [TM.TMXPrevious[0], TM.TMXCurrent, TM.TMXNext[0]],
      [TM.TMXNext[1], TM.TMXNext[2], TM.TMXNext[3]]
    ]
    for (let i = 0; i < 3; i++) {
      const challenge = pages[page][i]
      if (challenge === undefined) {
        continue
      }
      const tmxInfo = TMXPages[page][i]
      let tmxXml = ''
      if (tmxInfo !== null) {
        let lbRating: string = tmxInfo.leaderboardRating.toString()
        let lbIcon = "https://cdn.discordapp.com/attachments/793464821030322196/986689958804869170/trophyw.png"
        if (tmxInfo.isClassic === true) {
          lbRating = 'Classic'
          lbIcon = "https://cdn.discordapp.com/attachments/793464821030322196/986689958343483463/trophyg.png"
        }
        if (tmxInfo.isNadeo === true) {
          lbRating = 'Nadeo'
          lbIcon = "https://cdn.discordapp.com/attachments/793464821030322196/986689958553202708/trophyn.png"
        }
        tmxXml += `
                <quad posn="0.4 -34.2 3" sizen="2 2" style="Icons128x128_1" substyle="NewTrack"/>
                <label posn="2.5 -34.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.type} "/>
                <quad posn="0.4 -36.2 3" sizen="2 2" style="Icons128x128_1" substyle="Puzzle"/>
                <label posn="2.5 -36.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.routes}"/>
                <quad posn="8 -32.2 3" sizen="2 2" style="Icons128x128_1" substyle="Custom"/>
                <label posn="10.1 -32.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.style}"/>
                <quad posn="8 -34.2 3" sizen="2 2" style="Icons128x128_1" substyle="United"/>
                <label posn="10.1 -34.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.difficulty}"/>
                <quad posn="8 -36.2 3" sizen="2 2" image="https://cdn.discordapp.com/attachments/793464821030322196/986680709538267227/build2.dds"/>
                <label posn="10.1 -36.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.lastUpdateDate.getDate().toString().padStart(2, '0')}/${(tmxInfo.lastUpdateDate.getMonth() + 1).toString().padStart(2, '0')}/${tmxInfo.lastUpdateDate.getFullYear()}"/>
                <quad posn="17.5 -32.2 3" sizen="2 2" image="${lbIcon}"/>
                <label posn="19.6 -32.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + lbRating}"/>
                <quad posn="17.5 -34.2 3" sizen="2 2" style="Icons128x32_1" substyle="RT_Cup"/>
                <label posn="19.6 -34.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.awards}"/>
                <quad posn="17.5 -36.2 3" sizen="2 2" style="Icons128x128_1" substyle="Credits"/>
                <label posn="19.6 -36.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.game}"/>
                <quad posn="3.8 -49 3" sizen="3.5 3.5" style="Icons128x128_1" substyle="Save" url="${tmxInfo.downloadUrl.replace(/^https:\/\//, '')}"/>
                <quad posn="10.7 -49.2 3" sizen="3.2 3.2" style="Icons128x128_1" substyle="Multiplayer" url="${TM.safeString(`http://dedimania.net/tmstats/?do=stat&Uid=${TM.challenge.id}&Show=RECORDS`.replace(/^https:\/\//, ''))}"/>
                <quad posn="18 -49.2 3" sizen="3.2 3.2" style="Icons128x128_1" substyle="ServersAll" url="${tmxInfo.pageUrl.replace(/^https:\/\//, '')}"/>`
      }
      const recordIndex = TM.records.filter(a => a.challenge === challenge.id).sort((a, b) => a.score - b.score).findIndex(a => a.login === login) + 1
      let recordIndexString
      if (recordIndex === 0) { recordIndexString = "--" }
      else if (recordIndex.toString().length === 1) { recordIndexString = `0${recordIndex}` }
      else { recordIndexString = recordIndex.toString() }
      let replaysXml = `<quad posn="0.4 -39 2" sizen="24.2 9.8" style="BgsPlayerCard" substyle="BgCardSystem"/>
            <quad posn="5 -39.5 3" sizen="2.1 2.1" style="Icons128x128_1" substyle="Solo"/>
            <quad posn="11 -39.5 3" sizen="2 2" style="BgRaceScore2" substyle="ScoreLink"/>
            <quad posn="17.3 -39.5 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>`
      const medals = ['MedalGold', 'MedalSilver', 'MedalBronze']
      for (let i = 0; i < 3; i++) {
        const imgPos = -(41.7 + (2.3 * i))
        const txtPos = -(41.9 + (2.3 * i))
        if (tmxInfo !== null && tmxInfo.replays[i] !== undefined) {
          replaysXml += `
                    <quad posn="0.9 ${imgPos} 3" sizen="2 2" style="MedalsBig" substyle="${medals[i]}"/>
                    <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.safeString(tmxInfo.replays[i].name)}"/>
                    <label posn="10 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(tmxInfo.replays[i].time)}"/>
                    <label posn="15.5 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.replays[i].recordDate.getDate().toString().padStart(2, '0')}/${(tmxInfo.replays[i].recordDate.getMonth() + 1).toString().padStart(2, '0')}/${tmxInfo.replays[i].recordDate.getFullYear()}"/>
                    <quad posn="22 ${imgPos + 0.2} 3" sizen="2 2" style="Icons128x128_1" substyle="Save" url="${tmxInfo.replays[i].url.replace(/^https:\/\//, '')}"/>`
        }
        else {
          replaysXml += `
                    <quad posn="0.9 ${imgPos} 3" sizen="2 2" style="MedalsBig" substyle="${medals[i]}"/>
                    <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}N/A"/>
                    <label posn="10 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}-:--.--"/>
                    <label posn="15.5 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}--/--/----"/>`
        }
      }
      const image = tmxInfo === null ? `https://cdn.discordapp.com/attachments/793464821030322196/986680709538267227/build2.dds` : TM.safeString(tmxInfo.thumbnailUrl + `&.jpeg`)
      xml += `
        <frame posn="${i * 26} 0 0.02">
          <quad posn="0 0 1" sizen="25 53" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
          <quad posn="0.4 -0.36 2" sizen="24.2 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>
          <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
          <format textsize="1.3" textcolor="FFFF"/>
          <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + titles[i]}"/>
          <quad posn="1 -3.5 2" sizen="23 18" style="Bgs1" substyle="BgCard"/>
          <quad posn="1.1 -3.6 3" sizen="22.8 17.8" image="${image}"/>
          <label posn="1 -22.5 3" sizen="15.2 3" scale="1.5" text="${CFG.widgetStyleRace.formattingCodes + TM.safeString(TM.strip(challenge.name, false))}"/>
          <label posn="1 -25.7 3" sizen="16.2 2" scale="1.2" text="${CFG.widgetStyleRace.formattingCodes}by ${TM.safeString(challenge.author)}"/>
          <quad posn="0.4 -28.2 3" sizen="2 2" style="BgRaceScore2" substyle="ScoreLink"/>
          <label posn="2.5 -28.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(challenge.authorTime)}"/>
          <quad posn="0.4 -30.2 3" sizen="2 2" style="Icons128x128_1" substyle="Vehicles"/>
          <label posn="2.5 -30.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.environment}"/>
          <quad posn="0.4 -32.2 3" sizen="2 2" style="Icons64x64_1" substyle="StateFavourite"/>
          <label posn="2.5 -32.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}100"/>
          <quad posn="8 -28.2 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>
          <label posn="10.1 -28.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}${challenge.addDate.getDate().toString().padStart(2, '0')}/${(challenge.addDate.getMonth() + 1).toString().padStart(2, '0')}/${challenge.addDate.getFullYear()}"/>
          <quad posn="8 -30.2 3" sizen="2 2" style="Icons128x128_1" substyle="Manialink"/>
          <label posn="10.1 -30.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.mood}"/>
          <quad posn="17.5 -28.2 3" sizen="2 2" style="BgRaceScore2" substyle="LadderRank"/>
          <label posn="19.6 -28.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + recordIndexString}."/>
          <quad posn="17.5 -30.2 3" sizen="2 2" style="Icons128x128_1" substyle="Coppers"/>
          <label posn="19.6 -30.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.copperPrice}"/>
          ${tmxXml}
          ${replaysXml}
        </frame>`
    }
    return xml
  }

  constructFooter(login: string): string {
    const playerPage = this.playerPages.find(a => a.login === login)
    if (playerPage === undefined) {
      TM.error(`Can't find player ${login} in the memory`)
      return `<quad posn="39.6 -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
          imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
          image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
    }
    const prevCount = Math.ceil((Math.min(this.previousMapsCount, TM.previousChallenges.length) - 1) / this.itemsPerPage)
    const nextCount = Math.ceil((this.queueMapsCount - 1) / this.itemsPerPage)
    this.paginator.updatePageCount(prevCount + 1 + nextCount)
    return this.paginator.constructXml(playerPage.page)
  }

} 