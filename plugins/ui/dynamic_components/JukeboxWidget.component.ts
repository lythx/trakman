import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import Config from '../UIConfig.json' assert { type: 'json' }
import Paginator from '../Paginator.js'
const CFG = Config.widgetStyleRace

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
  }

  setupListeners(): void {
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.id + 1000 && info.answer <= this.id + 6000) {
        const challengeId = this.challengeActionIds[info.answer - (this.id + 1000)]
        this.handleMapClick(challengeId, info.answer, info.login, info.nickName)
        const playerPage = this.playerPages.find(a => a.login === info.login)
        if (playerPage === undefined) {
          this.playerPages.push({ login: info.login, page: 1 })
          this.displayToPlayer(info.login, 1)
          return
        }
        this.displayToPlayer(info.login, playerPage.page)
      }
      else if (info.answer >= this.id + 1 && info.answer <= this.id + 6) {
        const playerPage = this.playerPages.find(a => a.login === info.login)
        if (playerPage === undefined) { // Should never happen
          TM.error(`Can't find player ${info.login} in playerPages array in JukeboxWidget.`, `Clicked manialink id: ${info.answer}`)
          this.closeToPlayer(info.login)
          return
        }
        const page = this.paginator.getPageFromClick(info.answer, playerPage.page)
        playerPage.page = page
        this.displayToPlayer(info.login, page)
      } else if (info.answer === this.id) {
        const playerPage = this.playerPages.find(a => a.login === info.login)
        if (playerPage === undefined) {
          this.playerPages.push({ login: info.login, page: 1 })
          this.displayToPlayer(info.login, 1)
          return
        }
        this.displayToPlayer(info.login, playerPage.page)
      }
      else if (info.answer === this.closeId) { this.closeToPlayer(info.login) }
    })
  }

  constructContent(login: string, page: number): string {
    const challenges = [...TM.challenges]
    challenges.sort((a, b) => a.name.localeCompare(b.name))
    challenges.sort((a, b) => a.author.localeCompare(b.author))
    let xml = ''
    let trackIndex = (this.gridHeight * this.gridWidth) * (page - 1)
    for (let i = 0; i < this.gridHeight; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        trackIndex++
        if (challenges[trackIndex] === undefined) { break }
        const recordIndexString = this.getRecordIndexString(login, challenges[trackIndex].id)
        const actionId = this.getActionId(challenges[trackIndex].id)
        const header = this.getHeader(challenges[trackIndex].id, actionId)
        xml += `
          <frame posn="${j * 15.75} ${-i * 10.9} 0.02">
            ${header}
            <quad posn="0 0 1" sizen="14.5 10" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
            <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
            <format textsize="1.3" textcolor="FFFF"/>
            <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${CFG.formattingCodes}Track #${trackIndex}"/>
            <label posn="0.7 -3.1 3" sizen="13 2" scale="1" text="${CFG.formattingCodes + TM.safeString(TM.strip(challenges[trackIndex].name, false))}"/>
            <label posn="0.7 -5.3 3" sizen="13 2" scale="0.9" text="${CFG.formattingCodes}by ${TM.safeString(challenges[trackIndex].author)}"/>
            <format textsize="1" textcolor="FFFF"/>
            <quad posn="0.4 -7.6 3" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>
            <label posn="2.1 -7.9 3" sizen="4.4 2" scale="0.75" text="${CFG.formattingCodes + TM.Utils.getTimeString(challenges[trackIndex].authorTime)}"/>
            <quad posn="5.7 -7.5 3" sizen="1.9 1.9" style="BgRaceScore2" substyle="LadderRank"/>
            <label posn="7.5 -7.9 3" sizen="3 2" scale="0.75" text="${CFG.formattingCodes + recordIndexString}"/>
            <quad posn="10.2 -7.4 3" sizen="1.9 1.9" style="Icons64x64_1" substyle="StateFavourite"/>
            <label posn="12.1 -7.9 3" sizen="3 2" scale="0.75" text="${CFG.formattingCodes}100"/>
          </frame>`
      }
    }
    return xml
  }

  constructFooter(login: string, page: number): string {
    return this.paginator.constructXml(page)
  }

  private handleMapClick(challengeId: string, actionId: number, login: string, nickName: string) {
    if (challengeId === undefined) {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, login)
      TM.error('Error while adding map to queue from jukebox', `Can't find actionId ${actionId} in memory`)
      return
    }
    const challenge = TM.challenges.find(a => a.id === challengeId)
    if (challenge === undefined) {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, login)
      TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${challengeId} in memory`)
      return
    }
    if (TM.jukebox.some(a => a.id === challengeId)) {
      TM.removeFromJukebox(challengeId)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
    }
    else {
      TM.addToJukebox(challengeId)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} to the queue.`)
    }
  }

  private getRecordIndexString(login: string, challengeId: string): string {
    // IDK IF I NEED TO SORT HERE NEED TO CHECK LATER
    const recordIndex = TM.records.filter(a => a.challenge === challengeId).sort((a, b) => a.score - b.score).findIndex(a => a.login === login) + 1
    if (recordIndex === 0) { return "--." }
    else { return TM.Utils.getPositionString(recordIndex) }
  }

  private getActionId(challengeId: string): number {
    const challengeActionId = this.challengeActionIds.indexOf(challengeId)
    if (challengeActionId !== -1) { return challengeActionId + this.id + 1000 }
    else {
      this.challengeActionIds.push(challengeId)
      return this.challengeActionIds.length - 1 + this.id + 1000
    }
  }

  private getHeader(challengeId: string, actionId: number): string {
    if (TM.jukebox.some(a => a.id === challengeId)) {
      return `<quad posn="0 0 4" sizen="14.5 10" action="${actionId}"
          image="http://maniacdn.net/undef.de/uaseco/blank.png" 
          imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260325638154/minusek8.png"/>
          <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="Bgs1InRace" substyle="BgListLine"/>`
    }
    else {
      return `<quad posn="0 0 4" sizen="14.5 10" action="${actionId}" 
          image="http://maniacdn.net/undef.de/uaseco/blank.png" 
          imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260547911740/plusek8.png"/>
          <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>`
    }
  }

} 