import IDS from '../config/UtilIds.js'
import { centeredText, rightAlignedText } from './TextUtils.js'
import { Vote } from '../../vote/Vote.js'
import { StaticHeader } from '../UiUtils.js'
import config from './VoteWindow.config.js'

/**
 * Util to manage votes and render vote manialink window
 */
export default class VoteWindow {

  private vote: Vote
  private readonly title = config.title
  private readonly message: string
  private readonly icon: string
  private readonly id = IDS.VoteWindow.window
  private readonly width = config.width
  private readonly height = config.height
  private readonly positionX = config.posX
  private readonly positionY = config.posY
  private readonly header = new StaticHeader('race')
  private readonly headerHeight = this.header.options.height
  private readonly margin = config.margin
  private readonly bg = config.background
  private readonly buttonW = config.buttonWidth
  private readonly buttonH = config.buttonHeight
  private readonly rightW = this.buttonW * 2 + 3 * this.margin
  private readonly leftW = this.width - this.rightW
  private readonly chatMessage: string

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
  }

  /**
   * @param eligibleLogins List of logins of players that can vote
   * @returns Vote result as boolean if time ran out or all the players voted, object containing result and optional caller player object
   * if vote got passed or cancelled, undefined if there is another vote running
   */
  startAndGetResult(eligibleLogins: string[]): Promise<boolean | { result: boolean, caller?: tm.Player }> | undefined {
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
        tm.sendMessage(this.chatMessage, e)
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

  private display(votes: { login: string; vote: boolean; }[], seconds: number) {
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
      </manialink>`, e)
    }
  }

  private hide() {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

  private constructHeader() {
    const cfg = this.header.options
    return `
    <quad posn="0 0 1" sizen="${this.width - (cfg.squareWidth + cfg.margin)} ${cfg.height}" bgcolor="${cfg.textBackground}"/>
    ${rightAlignedText(this.title, this.width - (cfg.squareWidth + cfg.margin), cfg.height, { textScale: cfg.textScale, xOffset: config.headerTextXOffset })}
    <frame posn="${this.width - (cfg.squareWidth + cfg.margin) + cfg.margin} 0 1">
      <quad posn="0 0 1" sizen="${cfg.squareWidth} ${cfg.height}" bgcolor="${cfg.textBackground}"/>
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
    const colour = (neededAmount - (allVotes - noVotes)) <= 0 ? `$${config.colours.yes}` : `$${config.colours.no}`
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

  private constructRight(votes: { login: string; vote: boolean; }[], seconds: number) {
    const w = this.rightW
    const h = this.height - (this.headerHeight + this.margin)
    const rowH = (h - this.buttonH) / 2 - this.margin
    const timeColour = '$' + config.colours.timer[[...config.timerColourChanges, -1].findIndex(a => a < seconds)]
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

}