import { trakman as TM } from "../../../src/Trakman.js"
import IDS from '../config/UtilIds.json' assert { type: 'json' }
import CONFIG from '../config/UIConfig.json' assert { type: 'json' }
import ICONS from '../config/Icons.json' assert { type: 'json' }
import { centeredText, rightAlignedText } from './TextUtils.js'
import { Vote } from '../../Vote.js'

export default class VoteWindow {

  private vote: Vote
  private readonly title = CONFIG.voteWindow.title
  private readonly message: string
  private readonly icon: string
  private readonly id = IDS.VoteWindow.window
  private readonly width = CONFIG.voteWindow.width
  private readonly height = CONFIG.voteWindow.height
  private readonly positionX = CONFIG.static.leftPosition + CONFIG.marginBig + CONFIG.static.width
  private readonly positionY = CONFIG.static.topBorder - (CONFIG.bestCps.height + CONFIG.marginBig)
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.marginSmall
  private readonly bg = CONFIG.static.bgColor
  private readonly buttonW = 2.5
  private readonly buttonH = 2.5
  private readonly rightW = this.buttonW * 2 + 3 * this.margin
  private readonly leftW = this.width - this.rightW
  private readonly chatMessage: string

  constructor(callerLogin: string, goal: number, message: string, chatMessage: string, seconds: number, iconPresetOrUrl: "voteGreen" | "voteRed" | Omit<string, "voteGreen" | "voteRed">) {
    this.vote = new Vote(callerLogin, goal, seconds)
    this.chatMessage = chatMessage
    this.message = message
    if (iconPresetOrUrl === "voteGreen") {
      this.icon = this.stringToIcon(CONFIG.voteWindow.iconGreen)
    } else if (iconPresetOrUrl === "voteRed") {
      this.icon = this.stringToIcon(CONFIG.voteWindow.iconRed)
    } else {
      this.icon = iconPresetOrUrl as string
    }
  }

  /**
   * @param eligibleLogins list of logins of players that can vote
   * @returns undefined if there is another vote running, Error with reason if someone cancelled the vote or vote result
   */
  startAndGetResult(eligibleLogins: string[]): Promise<boolean | { result: boolean, callerLogin?: string }> | undefined {
    return new Promise((resolve) => {
      this.vote.onUpdate = (votes, seconds) => {
        this.display(votes, seconds)
      }
      this.vote.onInterrupt = (info) => {
        this.hide()
        resolve(info)
      }
      this.vote.onEnd = (info) => {
        this.hide()
        resolve(info)
      }
      this.vote.onSecondsChanged = (seconds, votes) => {
        this.display(votes, seconds)
      }
      if (this.vote.start(eligibleLogins) === false) { return }
      for (const e of this.vote.loginList) {
        TM.sendMessage(this.chatMessage, e)
      }
    })
  }

  pass(callerLogin?: string): void {
    this.vote.pass(callerLogin)
  }

  cancel(callerLogin?: string): void {
    this.vote.cancel(callerLogin)
  }

  private display(votes: { login: string; vote: boolean; }[], seconds: number) {
    for (const e of this.vote.loginList) {
      TM.sendManialink(`<manialink id="${this.id}">
        <format textsize="1"/>
        <frame posn="${this.positionX} ${this.positionY} 1">
          ${this.constructHeader()}
        </frame>
        <frame posn="${this.positionX} ${this.positionY - (this.headerHeight + this.margin)}">
          ${this.constructLeft(votes)}
        </frame>
        <frame posn="${this.positionX + this.leftW + this.margin} ${this.positionY - (this.headerHeight + this.margin)}">
          ${this.constructRight(votes, seconds)}
        </frame>
      </manialink>`, e)
    }
  }

  private hide() {
    TM.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

  private constructHeader() {
    const cfg = CONFIG.staticHeader
    return `
    <quad posn="0 0 1" sizen="${this.width - (cfg.squareWidth + cfg.margin)} ${cfg.height}" bgcolor="${cfg.bgColor}"/>
    ${rightAlignedText(this.title, this.width - (cfg.squareWidth + cfg.margin), cfg.height, { textScale: cfg.textScale, yOffset: -0.1, xOffset: 0.2 })}
    <frame posn="${this.width - (cfg.squareWidth + cfg.margin) + cfg.margin} 0 1">
      <quad posn="0 0 1" sizen="${cfg.squareWidth} ${cfg.height}" bgcolor="${cfg.bgColor}"/>
      <quad posn="${cfg.iconHorizontalPadding} ${-cfg.iconVerticalPadding} 4" sizen="${cfg.iconWidth} ${cfg.iconHeight}" image="${this.icon}"/> 
    </frame>`
  }

  private constructLeft(votes: { login: string; vote: boolean; }[]) {
    const w = this.leftW
    const h = this.height - (this.headerHeight + this.margin)
    const rowH = (h - this.buttonH) / 2 - this.margin
    const allVotes = votes.length
    const noVotes = votes.filter(a => a.vote === false).length
    const noVotesW = (noVotes / votes.length) * w
    const neededAmount = Math.ceil(allVotes * this.vote.goal)
    const colour = (neededAmount - (allVotes - noVotes)) <= 0 ? '$0F0' : '$F00'
    return `
    <quad posn="0 0 1" sizen="${w} ${rowH}" bgcolor="${this.bg}"/>
    ${centeredText(this.message, w, rowH, { textScale: 1 })}
    <frame posn="0 ${-rowH - this.margin} 1">
    <quad posn="0 0 1" sizen="${w} ${rowH}" bgcolor="${this.bg}"/>
    ${centeredText(`Votes needed to pass: ${colour}${neededAmount}`, w, rowH, { textScale: 1 })}
    </frame>
    <frame posn="0 ${-h + this.buttonH} 1">
      <quad posn="0 0 1" sizen="${w} ${this.buttonH}" bgcolor="${this.bg}" action="${this.vote.noId}"/>
      <quad posn="${this.margin} ${-this.margin} 2" sizen="${w - this.margin * 2} ${this.buttonH - this.margin * 2}" bgcolor="0D0F"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${noVotesW - this.margin * 2} ${this.buttonH - this.margin * 2}" bgcolor="F00F"/>
    </frame>`
  }

  private constructRight(votes: { login: string; vote: boolean; }[], seconds: number) {
    const w = this.rightW
    const h = this.height - (this.headerHeight + this.margin)
    const rowH = (h - this.buttonH) / 2 - this.margin
    const timeColour = ['$FFF', '$FF0', '$F00'][[20, 5, -1].findIndex(a => a < seconds)]
    return `<quad posn="0 0 1" sizen="${w - this.margin} ${rowH}" bgcolor="${this.bg}"/>
    ${centeredText(`${timeColour}${seconds}`, w - this.margin, rowH, { textScale: 0.4, specialFont: true })}
    <frame posn="0 ${-rowH - this.margin} 1">
      <quad posn="0 0 1" sizen="${w / 2 - this.margin} ${rowH}" bgcolor="${this.bg}"/>
      ${centeredText(`$F00` + votes.filter(a => a.vote === false).length.toString(), w / 2 - this.margin, rowH, { textScale: 1 })}
      <quad posn="${w / 2} 0 1" sizen="${w / 2 - this.margin} ${rowH}" bgcolor="${this.bg}"/>
      ${centeredText(`$0F0` + votes.filter(a => a.vote === true).length.toString(), w / 2 - this.margin, rowH, { xOffset: w / 2, textScale: 1 })}
    </frame>
    <frame posn="0 ${-h + this.buttonH} 1">
      <quad posn="0 0 1" sizen="${w / 2 - this.margin} ${this.buttonH}" bgcolor="${this.bg}" action="${this.vote.noId}"/>
      <quad posn="${this.margin} ${-this.margin} 3" sizen="${w / 2 - this.margin * 3} ${this.buttonH - this.margin * 2}" image="${this.stringToIcon('F6')}"/>
      <quad posn="${w / 2} 0 1" sizen="${w / 2 - this.margin} ${this.buttonH}" bgcolor="${this.bg}" action="${this.vote.yesId}"/>
      <quad posn="${w / 2 + this.margin} ${-this.margin} 3" sizen="${w / 2 - this.margin * 3} ${this.buttonH - this.margin * 2}" image="${this.stringToIcon('F5')}"/>
    </frame>`
  }

  private stringToIcon = (str: string): any => {
    const split: string[] = str.split('.')
    let obj = ICONS
    for (const e of split) {
      obj = (obj as any)[e]
    }
    return obj
  }

}