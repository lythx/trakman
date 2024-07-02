import IDS from '../config/UtilIds.js'
import { centeredText, rightAlignedText } from './TextUtils.js'
import { Vote } from '../../vote/Vote.js'
import { addManialinkListener, removeManialinkListener, StaticHeader, type StaticHeaderOptions } from '../UI.js'
import config from './VoteWindow.config.js'

/**
 * Util to manage votes and render vote manialink window
 */
export default class VoteWindow {

  private vote: Vote
  private readonly title: string = config.title
  private readonly message: string
  private readonly icon: string
  private readonly id: number = IDS.VoteWindow.window
  private readonly width: number = config.width
  private readonly height: number = config.height
  private readonly positionX: number = config.posX
  private readonly positionY: number = config.posY
  private readonly header: StaticHeader = new StaticHeader('race')
  private readonly headerHeight: number = this.header.options.height
  private readonly margin: number = config.margin
  private readonly bg: string = config.background
  private readonly buttonW: number = config.buttonWidth
  private readonly buttonH: number = config.buttonHeight
  private readonly rightW: number = this.buttonW * 2 + 3 * this.margin
  private readonly leftW: number = this.width - this.rightW
  private readonly chatMessage: string
  private readonly passId: number = IDS.VoteWindow.pass
  private readonly cancelId: number = IDS.VoteWindow.cancel
  private readonly passListener: (info: tm.ManialinkClickInfo) => void
  private readonly cancelListener: (info: tm.ManialinkClickInfo) => void

  /**
   * Util to manage votes and render vote manialink window
   * @param callerLogin Login of the player who called the vote
   * @param goal Ratio of votes needed to pass the vote (must be between 0 and 1)
   * @param headerMessage Message displayed in vote window header
   * @param chatMessage Chat message sent to chat on vote start
   * @param seconds Amount of time to vote
   * @param iconUrl Icon image url
   */
  constructor(callerLogin: string, goal: number, headerMessage: string, chatMessage: string, seconds: number, iconUrl: string) {
    this.vote = new Vote(callerLogin, goal, seconds)
    this.chatMessage = chatMessage
    this.message = headerMessage
    this.icon = iconUrl
    this.passListener = (info: tm.ManialinkClickInfo) => {
      this.pass(info)
    }
    this.cancelListener = (info: tm.ManialinkClickInfo) => {
      this.cancel(info)
    }
  }

  /**
   * Starts the vote and awaits result.
   * @param eligibleLogins List of logins of players that can vote
   * @returns Vote result as boolean if time ran out or all the players voted, object containing result and optional caller player object
   * if vote got passed or cancelled, undefined if there is another vote running
   */
  startAndGetResult(eligibleLogins: { login: string, privilege: number }[]): Promise<boolean | { result: boolean, caller?: tm.Player }> | undefined {
    return new Promise((resolve): void => {
      this.vote.onUpdate = (votes, seconds): void => {
        this.display(votes, seconds)
      }
      this.vote.onInterrupt = (info): void => {
        this.hide()
        removeManialinkListener(this.passListener)
        removeManialinkListener(this.cancelListener)
        resolve(info)
      }
      this.vote.onEnd = (info): void => {
        this.hide()
        removeManialinkListener(this.passListener)
        removeManialinkListener(this.cancelListener)
        resolve(info)
      }
      this.vote.onSecondsChanged = (seconds, votes): void => {
        this.display(votes, seconds)
      }
      if (!this.vote.start(eligibleLogins)) { return }
      addManialinkListener(this.passId, this.passListener)
      addManialinkListener(this.cancelId, this.cancelListener)
      for (const e of this.vote.loginList) {
        tm.sendMessage(this.chatMessage, e.login)
      }
    })
  }

  /**
   * Passes the vote
   * @param caller Caller player object
   */
  pass(caller?: tm.Player): void {
    this.vote.pass(caller)
  }

  /**
   * Cancels the vote
   * @param caller Caller player object
   */
  cancel(caller?: tm.Player): void {
    this.vote.cancel(caller)
  }

  private display(votes: { login: string; vote: boolean; }[], seconds: number): void {
    for (const e of this.vote.loginList) {
      tm.sendManialink(`<manialink id="${this.id}">
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
        ${e.privilege < Vote.passCancelPrivilege ? '' :
          `<frame posn="${this.positionX} ${this.positionY - (this.height + this.margin)}">
            ${this.constructAdminButtons()}
          </frame>`}
      </manialink>`, e.login)
    }
  }

  private hide(): void {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

  private constructHeader(): string {
    const cfg: StaticHeaderOptions = this.header.options
    return `
    <quad posn="0 0 1" sizen="${this.width - (cfg.squareWidth + cfg.margin)} ${cfg.height}" bgcolor="${cfg.textBackground}"/>
    ${rightAlignedText(this.title, this.width - (cfg.squareWidth + cfg.margin), cfg.height, { textScale: cfg.textScale, xOffset: config.headerTextXOffset })}
    <frame posn="${this.width - (cfg.squareWidth + cfg.margin) + cfg.margin} 0 1">
      <quad posn="0 0 1" sizen="${cfg.squareWidth} ${cfg.height}" bgcolor="${cfg.textBackground}"/>
      <quad posn="${cfg.iconHorizontalPadding} ${-cfg.iconVerticalPadding} 4" sizen="${cfg.iconWidth} ${cfg.iconHeight}" image="${this.icon}"/> 
    </frame>`
  }

  private constructLeft(votes: { login: string; vote: boolean; }[]): string {
    const w: number = this.leftW
    const h: number = this.height - (this.headerHeight + this.margin)
    const rowH: number = (h - this.buttonH) / 2 - this.margin
    const allVotes: number = votes.length
    const noVotes: number = votes.filter(a => a.vote === false).length
    const noVotesW: number = (noVotes / votes.length) * w
    const neededAmount: number = Math.ceil(allVotes * this.vote.goal)
    const colour: string = (neededAmount - (allVotes - noVotes)) <= 0 ? `$${config.colours.yes}` : `$${config.colours.no}`
    return `
    <quad posn="0 0 1" sizen="${w} ${rowH}" bgcolor="${this.bg}"/>
    ${centeredText(this.message, w, rowH, { textScale: config.bigTextScale })}
    <frame posn="0 ${-rowH - this.margin} 1">
    <quad posn="0 0 1" sizen="${w} ${rowH}" bgcolor="${this.bg}"/>
    ${centeredText(tm.utils.strVar(config.message, { colour, amount: neededAmount }), w, rowH, { textScale: config.bigTextScale })}
    </frame>
    <frame posn="0 ${-h + this.buttonH} 1">
      <quad posn="0 0 1" sizen="${w} ${this.buttonH}" bgcolor="${this.bg}" action="${this.vote.noId}"/>
      <quad posn="${this.margin} ${-this.margin} 2" sizen="${w - this.margin * 2} ${this.buttonH - this.margin * 2}" bgcolor="${config.colours.yes}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${noVotesW - this.margin * 2} ${this.buttonH - this.margin * 2}" bgcolor="${config.colours.no}"/>
    </frame>`
  }

  private constructRight(votes: { login: string; vote: boolean; }[], seconds: number): string {
    const w: number = this.rightW
    const h: number = this.height - (this.headerHeight + this.margin)
    const rowH: number = (h - this.buttonH) / 2 - this.margin
    const timeColour: string = '$' + config.colours.timer[[...config.timerColourChanges, -1].findIndex(a => a < seconds)]
    return `<quad posn="0 0 1" sizen="${w - this.margin} ${rowH}" bgcolor="${this.bg}"/>
    ${centeredText(`${timeColour}${seconds}`, w - this.margin, rowH, { textScale: config.counterTextScale, specialFont: true })}
    <frame posn="0 ${-rowH - this.margin} 1">
      <quad posn="0 0 1" sizen="${w / 2 - this.margin} ${rowH}" bgcolor="${this.bg}"/>
      ${centeredText(`$${config.colours.no}` + votes.filter(a => a.vote === false).length.toString(), w / 2 - this.margin, rowH, { textScale: config.bigTextScale })}
      <quad posn="${w / 2} 0 1" sizen="${w / 2 - this.margin} ${rowH}" bgcolor="${this.bg}"/>
      ${centeredText(`$${config.colours.yes}` + votes.filter(a => a.vote === true).length.toString(), w / 2 - this.margin, rowH, { xOffset: w / 2, textScale: config.bigTextScale })}
    </frame>
    <frame posn="0 ${-h + this.buttonH} 1">
      <quad posn="0 0 1" sizen="${w / 2 - this.margin} ${this.buttonH}" bgcolor="${this.bg}" action="${this.vote.noId}"/>
      <quad posn="${this.margin} ${-this.margin} 3" sizen="${w / 2 - this.margin * 3} ${this.buttonH - this.margin * 2}" image="${config.F6Button}"/>
      <quad posn="${w / 2} 0 1" sizen="${w / 2 - this.margin} ${this.buttonH}" bgcolor="${this.bg}" action="${this.vote.yesId}"/>
      <quad posn="${w / 2 + this.margin} ${-this.margin} 3" sizen="${w / 2 - this.margin * 3} ${this.buttonH - this.margin * 2}" image="${config.F5Button}"/>
    </frame>`
  }

  private constructAdminButtons() {
    const cfg = config.adminButtons
    const w = cfg.width
    const h = cfg.height
    return `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.bg}" action="${this.cancelId}"/>
      ${centeredText(cfg.cancelText, w, h, { textScale: cfg.textScale })} 
    <frame posn="${w + this.margin} 0 1">
      <quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.bg}" action="${this.passId}"/>
       ${centeredText(cfg.passText, w, h, { textScale: cfg.textScale })} 
    </frame>`
  }

}
