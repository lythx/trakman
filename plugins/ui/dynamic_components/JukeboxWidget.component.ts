import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import CFG from '../UIConfig.json' assert { type: 'json' }
import Paginator from '../Paginator.js'

interface PlayerPage {
  readonly login: string
  page: number
}

export default class JukeboxWidget extends PopupWindow implements IPopupWindow {

  readonly gridWidth = 5
  readonly gridHeight = 4
  private readonly paginator: Paginator
  private readonly challengeActionIds: string[] = []
  private readonly playerPages: PlayerPage[] = []

  constructor(openId: number, closeId: number) {
    super(openId, closeId)
    this.paginator = new Paginator(this.openId, this.closeId, Math.ceil(TM.challenges.length / (this.gridHeight * this.gridWidth)))
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.id + 1000 && info.answer <= this.id + 6000) {
        const challengeId = this.challengeActionIds[info.answer - (this.id + 1000)]
        if (challengeId === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
          TM.error('Error while adding map to queue from jukebox', `Can't find actionId ${info.answer} in memory`)
          return
        }
        const challenge = TM.challenges.find(a => a.id === challengeId)
        if (challenge === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
          TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${challengeId} in memory`)
          return
        }
        if (TM.jukebox.some(a => a.id === challengeId)) {
          TM.removeFromJukebox(challengeId)
          TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickName, true)} `
            + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
        }
        else {
          TM.addToJukebox(challengeId)
          TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickName, true)} `
            + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} to the queue.`)
        }
        this.displayToPlayer(info.login)
      }
      else if (info.answer >= this.id + 1 && info.answer <= this.id + 6) {
        const playerPage = this.playerPages.find(a => a.login === info.login)
        if (playerPage === undefined) {
          TM.error(`Can't find player ${info.login} in memory`)
          return
        }
        const page = this.paginator.getPageFromClick(info.answer, playerPage.page)
        playerPage.page = page
        this.displayToPlayer(info.login)
      }
    })
  }

  constructContent(login: string): string {
    let page: number
    const playerPage = this.playerPages.find(a => a.login === login)
    if (playerPage === undefined) {
      this.playerPages.push({ login, page: 1 })
      page = 1
    } else { page = playerPage.page }
    const challenges = [...TM.challenges]
    challenges.sort((a, b) => a.name.localeCompare(b.name))
    challenges.sort((a, b) => a.author.localeCompare(b.author))
    let xml = ''
    let n = (this.gridHeight * this.gridWidth) * (page - 1)
    for (let i = 0; i < this.gridHeight; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        n++
        if (challenges[n] === undefined) { break }
        const recordIndex = TM.records.filter(a => a.challenge === challenges[n].id).sort((a, b) => a.score - b.score).findIndex(a => a.login === login) + 1
        let recordIndexString
        if (recordIndex === 0) { recordIndexString = "--." }
        else { recordIndexString = TM.Utils.getPositionString(recordIndex) }
        let actionId: number
        const challengeActionId = this.challengeActionIds.indexOf(challenges[n].id)
        if (challengeActionId !== -1) { actionId = challengeActionId + this.id + 1000 }
        else {
          actionId = this.id + 1000 + this.challengeActionIds.length
          this.challengeActionIds.push(challenges[n].id)
        }
        const header = TM.jukebox.some(a => a.id === challenges[n].id) ?
          `<quad posn="0 0 4" sizen="14.5 10" action="${actionId}"
           image="http://maniacdn.net/undef.de/uaseco/blank.png" 
           imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260325638154/minusek8.png"/>
          <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="Bgs1InRace" substyle="BgListLine"/>` :
          `<quad posn="0 0 4" sizen="14.5 10" action="${actionId}" 
           image="http://maniacdn.net/undef.de/uaseco/blank.png" 
           imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260547911740/plusek8.png"/>
          <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>`
        xml += `
          <frame posn="${j * 15.75} ${-i * 10.9} 0.02">
            ${header}
            <quad posn="0 0 1" sizen="14.5 10" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
            <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
            <format textsize="1.3" textcolor="FFFF"/>
            <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}Track #${n}"/>
            <label posn="0.7 -3.1 3" sizen="13 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.safeString(TM.strip(challenges[n].name, false))}"/>
            <label posn="0.7 -5.3 3" sizen="13 2" scale="0.9" text="${CFG.widgetStyleRace.formattingCodes}by ${TM.safeString(challenges[n].author)}"/>
            <format textsize="1" textcolor="FFFF"/>
            <quad posn="0.4 -7.6 3" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>
            <label posn="2.1 -7.9 3" sizen="4.4 2" scale="0.75" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(challenges[n].authorTime)}"/>
            <quad posn="5.7 -7.5 3" sizen="1.9 1.9" style="BgRaceScore2" substyle="LadderRank"/>
            <label posn="7.5 -7.9 3" sizen="3 2" scale="0.75" text="${CFG.widgetStyleRace.formattingCodes + recordIndexString}"/>
            <quad posn="10.2 -7.4 3" sizen="1.9 1.9" style="Icons64x64_1" substyle="StateFavourite"/>
            <label posn="12.1 -7.9 3" sizen="3 2" scale="0.75" text="${CFG.widgetStyleRace.formattingCodes}100"/>
          </frame>`
      }
    }
    return xml
  }

  constructFooter(login: string): string {
    const playerPage = this.playerPages.find(a => a.login === login)
    if (playerPage === undefined) {
      TM.error(`Can't find player ${login} in the memory`)
      return `<quad posn="39.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
              imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
              image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
    }
    return this.paginator.constructXml(playerPage.page)
  }
} 