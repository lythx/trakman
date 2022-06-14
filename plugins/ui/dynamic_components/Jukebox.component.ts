import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import CFG from '../UIConfig.json' assert { type: 'json' }

interface ChallengeActionId {
  readonly challengeId: string
  readonly actionId: number
}

export default class Jukebox extends PopupWindow implements IPopupWindow {

  readonly gridWidth = 5
  readonly gridHeight = 4
  private challengeActionIds: ChallengeActionId[] = []

  initialize(): void {
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer < this.id + 1000 || info.answer > this.id + 6000) { return }
      const challengeId = this.challengeActionIds.find(a => a.actionId === info.answer)?.challengeId
      if (challengeId === undefined) {
        TM.sendMessage(`Error while adding challenge to queue`, info.login)
        TM.error('Error while adding map to queue from jukebox', `Can't find actionId ${info.answer} in memory`)
        return
      }
      const challenge = TM.challenges.find(a => a.id === challengeId)
      if (challenge === undefined) {
        TM.sendMessage(`Error while adding challenge to queue`, info.login)
        TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${challengeId} in memory`)
        return
      }
      TM.addToQueue(challengeId)
      TM.sendMessage(`${info.nickName}$z$s added map ${TM.strip(challenge.name)} to the jukebox.`)
    })
  }

  constructContent(login: string): string {
    const challenges = TM.challenges
    challenges.sort((a, b) => a.author[0] > b.author[0] ? 1 : -1)
    let xml = ''
    let n = 0
    for (let i = 0; i < this.gridHeight; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        const recordIndex = TM.records.filter(a => a.challenge === challenges[n].id).sort((a, b) => a.score - b.score).findIndex(a => a.login === login)
        let recordIndexString
        if (recordIndex === -1) {
          recordIndexString = "--"
        }
        else if (recordIndex.toString().length === 1) {
          recordIndexString = `0${recordIndex}`
        }
        else {
          recordIndexString = recordIndex.toString()
        }
        n++
        let actionId: number
        const challengeActionId = this.challengeActionIds.find(a => a.challengeId === challenges[n].id)
        if (challengeActionId !== undefined) {
          actionId = challengeActionId.actionId
        }
        else {
          actionId = this.id + 1000
          while (this.challengeActionIds.some(a => a.actionId === actionId)) {
            actionId++
          }
        }
        this.challengeActionIds.push({ actionId, challengeId: challenges[n].id })
        xml += `
          <frame posn="${j * 15.75} ${-i * 10.9} 0.02">
            <quad posn="0 0 4" sizen="14.5 10" action="${actionId}" image="http://maniacdn.net/undef.de/uaseco/blank.png" 
             imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986329315945902130/plusek7.png"/>
            <quad posn="0 0 1" sizen="14.5 10" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
            <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>
            <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
            <format textsize="1.3" textcolor="FFFF"/>
            <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="Track #${n}"/>
            <label posn="0.7 -3.1 3" sizen="13 2" scale="1" text="${TM.safeString(TM.strip(challenges[n].name, false))}"/>
            <label posn="0.7 -5.3 3" sizen="16.2 2" scale="0.9" text="by ${TM.safeString(challenges[n].author)}"/>
            <format textsize="1" textcolor="FFFF"/>
            <quad posn="0.4 -7.45 3" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>
            <label posn="2.1 -7.75 3" sizen="4.4 2" scale="0.8" text="${TM.Utils.getTimeString(challenges[n].authorTime)}"/>
            <quad posn="5.7 -7.4 3" sizen="1.9 1.9" style="BgRaceScore2" substyle="LadderRank"/>
            <label posn="7.5 -7.75 3" sizen="3 2" scale="0.8" text="${recordIndexString}."/>
            <quad posn="10.2 -7.35 3" sizen="1.9 1.9" style="Icons64x64_1" substyle="StateFavourite"/>
            <label posn="12.1 -7.85 3" sizen="3 2" scale="0.8" text="100"/>
          </frame>` // TODO: manialink xml inside window here, for close button actionid use this.closeId
      }
    }
    return xml
  }
} 