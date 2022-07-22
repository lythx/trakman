import { TRAKMAN as TM } from "../../../src/Trakman.js"
import IDS from '../config/UtilIds.json' assert { type: 'json' }
import CONFIG from '../config/UIConfig.json' assert { type: 'json' }
import ICONS from '../config/Icons.json' assert { type: 'json' }

export default class VoteWindow {

  private static isListenerAdded = false
  private static isDisplayed = false
  private readonly goal: number
  private readonly title = CONFIG.voteWindow.title
  private readonly message: string
  private readonly icon: string
  private readonly id = IDS.VoteWindow.window
  readonly yesId = IDS.VoteWindow.voteYes
  readonly noId = IDS.VoteWindow.voteNo
  private readonly width = CONFIG.voteWindow.width
  private readonly height = CONFIG.voteWindow.height
  private readonly positionX = CONFIG.static.leftPosition + CONFIG.static.marginBig + CONFIG.static.width
  private readonly positionY = CONFIG.static.topBorder - (CONFIG.bestCps.height + CONFIG.static.marginBig)
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall
  private readonly bg = CONFIG.static.bgColor
  private readonly buttonW = 2.5
  private readonly buttonH = 2.5
  private readonly rightW = this.buttonW * 2 + 3 * this.margin
  private readonly leftW = this.width - this.rightW
  private readonly votes: { login: string, vote: boolean }[] = []
  private static listener: ((info: ManialinkClickInfo) => void) = () => undefined
  private loginList: string[] = []
  private isActive = false
  private seconds: number
  private interrupted: { callerLogin: string, result: boolean } | undefined

  constructor(callerLogin: string, goal: number, message: string, seconds: number, iconPresetOrUrl: "voteGreen" | "voteRed" | Omit<string, "voteGreen" | "voteRed">) {
    this.goal = goal
    this.message = message
    this.votes.push({ login: callerLogin, vote: true })
    if (iconPresetOrUrl === "voteGreen") {
      this.icon = this.stringToIcon(CONFIG.voteWindow.iconGreen)
    } else if (iconPresetOrUrl === "voteRed") {
      this.icon = this.stringToIcon(CONFIG.voteWindow.iconRed)
    } else {
      this.icon = iconPresetOrUrl as string
    }
    this.seconds = seconds
    if (VoteWindow.isListenerAdded === false) {
      VoteWindow.isListenerAdded = true
      TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => VoteWindow.listener(info))
    }
  }

  /**
   * @param eligibleLogins list of logins of players that can vote
   * @returns undefined if there is another vote running, Error with reason if someone cancelled the vote or vote result
   */
  startAndGetResult(eligibleLogins: string[]): Promise<boolean | { result: boolean, callerLogin: string }> | undefined {
    if (VoteWindow.isDisplayed === true) { return }
    VoteWindow.isDisplayed = true
    VoteWindow.listener = (info: ManialinkClickInfo) => {
      if (this.isActive === true && this.loginList.includes(info.login)) {
        const vote = this.votes.find(a => a.login === info.login)
        if (vote === undefined) {
          if (info.answer === this.yesId) { this.votes.push({ login: info.login, vote: true }) }
          else if (info.answer === this.noId) { this.votes.push({ login: info.login, vote: false }) }
        } else {
          if (info.answer === this.yesId) { vote.vote = true }
          else if (info.answer === this.noId) { vote.vote = false }
        }
        this.display()
      }
    }
    const startTime = Date.now()
    this.isActive = true
    this.loginList = eligibleLogins
    this.display()
    const maxSeconds = this.seconds + 1
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (Date.now() > startTime + (maxSeconds - this.seconds) * 1000) {
          if (this.interrupted !== undefined) {
            resolve(this.interrupted)
            return
          }
          this.seconds--
          if (this.seconds === -1) {
            resolve(this.conclude())
            this.hide()
            clearInterval(interval)
            VoteWindow.isDisplayed = false
            return
          }
          this.display()
        }
      }, 200)
    })
  }

  private conclude(): boolean {
    const allVotes = this.votes.length
    const yesVotes = this.votes.filter(a => a.vote === true).length
    this.isActive = false
    return (yesVotes / allVotes) > this.goal
  }

  pass(callerLogin: string): void {
    if (this.isActive === false) { return }
    this.interrupted = { callerLogin, result: true }
  }

  cancel(callerLogin: string): void {
    if (this.isActive === false) { return }
    this.interrupted = { callerLogin, result: false }
  }

  private display() {
    for (const e of this.loginList) {
      TM.sendManialink(`<manialink id="${this.id}">
        <format textsize="1"/>
        <frame posn="${this.positionX} ${this.positionY} 1">
          ${this.constructHeader()}
        </frame>
        <frame posn="${this.positionX} ${this.positionY - (this.headerHeight + this.margin)}">
          ${this.constructLeft()}
        </frame>
        <frame posn="${this.positionX + this.leftW + this.margin} ${this.positionY - (this.headerHeight + this.margin)}">
          ${this.constructRight()}
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
    ${this.rightAlignedText(this.title, this.width - (cfg.squareWidth + cfg.margin), cfg.height, { textScale: cfg.textScale })}
    <frame posn="${this.width - (cfg.squareWidth + cfg.margin) + cfg.margin} 0 1">
      <quad posn="0 0 1" sizen="${cfg.squareWidth} ${cfg.height}" bgcolor="${cfg.bgColor}"/>
      <quad posn="${cfg.iconHorizontalPadding} ${-cfg.iconVerticalPadding} 4" sizen="${cfg.iconWidth} ${cfg.iconHeight}" image="${this.icon}"/> 
    </frame>`
  }

  private constructLeft() {
    const w = this.leftW
    const h = this.height - (this.headerHeight + this.margin)
    const rowH = (h - this.buttonH) / 2 - this.margin
    const allVotes = this.votes.length
    const noVotes = this.votes.filter(a => a.vote === false).length
    const noVotesW = (noVotes / this.votes.length) * w
    const neededAmount = Math.ceil(allVotes * this.goal)
    const colour = (neededAmount - (allVotes - noVotes)) <= 0 ? '$0F0' : '$F00'
    return `
    <quad posn="0 0 1" sizen="${w} ${rowH}" bgcolor="${this.bg}"/>
    ${this.centeredText(this.message, w, rowH, { textScale: 1 })}
    <frame posn="0 ${-rowH - this.margin} 1">
    <quad posn="0 0 1" sizen="${w} ${rowH}" bgcolor="${this.bg}"/>
    ${this.centeredText(`Votes needed to pass: ${colour}${neededAmount}`, w, rowH, { textScale: 1 })}
    </frame>
    <frame posn="0 ${-h + this.buttonH} 1">
      <quad posn="0 0 1" sizen="${w} ${this.buttonH}" bgcolor="${this.bg}" action="${this.noId}"/>
      <quad posn="${this.margin} ${-this.margin} 2" sizen="${w - this.margin * 2} ${this.buttonH - this.margin * 2}" bgcolor="0D0F"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${noVotesW - this.margin * 2} ${this.buttonH - this.margin * 2}" bgcolor="F00F"/>
    </frame>`
  }

  private constructRight() {
    const w = this.rightW
    const h = this.height - (this.headerHeight + this.margin)
    const rowH = (h - this.buttonH) / 2 - this.margin
    const timeColour = ['$FFF', '$FF0', '$F00'][[20, 5, -1].findIndex(a => a < this.seconds)]
    return `<quad posn="0 0 1" sizen="${w - this.margin} ${rowH}" bgcolor="${this.bg}"/>
    ${this.centeredText(`${timeColour}${this.seconds}`, w - this.margin, rowH, { textScale: 0.4, specialFont: true })}
    <frame posn="0 ${-rowH - this.margin} 1">
      <quad posn="0 0 1" sizen="${w / 2 - this.margin} ${rowH}" bgcolor="${this.bg}"/>
      ${this.centeredText(`$F00` + this.votes.filter(a => a.vote === false).length.toString(), w / 2 - this.margin, rowH)}
      <quad posn="${w / 2} 0 1" sizen="${w / 2 - this.margin} ${rowH}" bgcolor="${this.bg}"/>
      ${this.centeredText(`$0F0` + this.votes.filter(a => a.vote === true).length.toString(), w / 2 - this.margin, rowH, { xOffset: w / 2 })}
    </frame>
    <frame posn="0 ${-h + this.buttonH} 1">
      <quad posn="0 0 1" sizen="${w / 2 - this.margin} ${this.buttonH}" bgcolor="${this.bg}" action="${this.noId}"/>
      <quad posn="${this.margin} ${-this.margin} 3" sizen="${w / 2 - this.margin * 3} ${this.buttonH - this.margin * 2}" bgcolor="F00F"/>
      <quad posn="${w / 2} 0 1" sizen="${w / 2 - this.margin} ${this.buttonH}" bgcolor="${this.bg}" action="${this.yesId}"/>
      <quad posn="${w / 2 + this.margin} ${-this.margin} 3" sizen="${w / 2 - this.margin * 3} ${this.buttonH - this.margin * 2}" bgcolor="0F0F"/>
    </frame>`
  }

  private rightAlignedText = (text: string, parentWidth: number, parentHeight: number, options?: { textScale?: number, padding?: number, xOffset?: number, yOffset?: number }): string => {
    const textScale: number = options?.textScale ?? 0.7
    const padding: number = options?.padding ?? 1
    const posX: number = options?.xOffset === undefined ? parentWidth - 0.5 : (parentWidth) + options?.xOffset - 0.5
    const posY: number = options?.yOffset === undefined ? parentHeight / 2 : (parentHeight / 2) + options?.yOffset
    return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${CONFIG.static.format}${TM.safeString(text)}" valign="center" halign="right"/>`
  }

  private centeredText = (text: string, parentWidth: number, parentHeight: number, params?: { xOffset?: number, yOffset?: number, specialFont?: true, textScale?: number }): string => {
    const textScale: number = params?.textScale ?? 1.2
    const padding: number = 0.2
    const posX: number = (parentWidth / 2) + (params?.xOffset ?? 0)
    const posY: number = (parentHeight / 2) + (params?.yOffset ?? -0.15)
    const styleStr = params?.specialFont ? `style="TextRaceChrono"` : ''
    return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${CONFIG.static.format}${CONFIG.static.format + TM.safeString(text)}" ${styleStr} valign="center" halign="center"/>`
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