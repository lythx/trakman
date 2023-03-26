import { addKeyListener } from "../ui/utils/KeyListener.js"
import IDS from '../ui/config/UtilIds.js'
import config from './Config.js'

/**
 * Provides utilites for in-game votes
 * @author lythx
 * @since 0.1
 */
export class Vote {

  private static isListenerAdded: boolean = false
  private static isDisplayed: boolean = false
  /** Manialink action ID of yes vote */
  readonly yesId: number = IDS.VoteWindow.voteYes
  /** Manialink action ID of no vote */
  readonly noId: number = IDS.VoteWindow.voteNo
  /** Manialink action ID of yes vote */
  readonly goal: number
  private readonly votes: { login: string, vote: boolean }[] = []
  private static listener: ((info: tm.ManialinkClickInfo) => void) = () => undefined
  private static endMapListener: () => void = () => undefined
  private static startMapListener: () => void = () => undefined
  private static onUpdate: ((votes: { login: string, vote: boolean }[], seconds: number, info: tm.ManialinkClickInfo) => void) = () => undefined
  private static onEnd: ((result: boolean, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  private static onInterrupt: ((info: {
    caller?: tm.Player,
    result: boolean
  }, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  private static onSecondsChanged: ((seconds: number, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  private static pass: (caller?: tm.Player) => void = () => undefined
  private static cancel: (caller?: tm.Player) => void = () => undefined
  /** 
   * Callback function to execute on vote ratio update. It takes votes array, seconds left, and ManialinkClickInfo as parameters
   */
  onUpdate: ((votes: { login: string, vote: boolean }[], seconds: number, info: tm.ManialinkClickInfo) => void) = () => undefined
  /** 
   * Callback function to execute on vote end. It takes result and votes array as parameters
   */
  onEnd: ((result: boolean, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  /** 
   * Callback function to execute on vote interrupt. It takes object containing result, optional player interrupting the vote
   * and votes array as parameters
   */
  onInterrupt: ((info: {
    caller?: tm.Player,
    result: boolean
  }, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  /** 
   * Callback function to execute on vote seconds left change. It takes seconds amount and votes array as parameters
   */
  onSecondsChanged: ((seconds: number, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  /** Logins of players who can vote */
  loginList: string[] = []
  private isActive: boolean = false
  private seconds: number
  private interrupted: { caller?: tm.Player, result: boolean } | undefined
  private readonly cancelOnRoundEnd: boolean
  private readonly cancelOnRoundStart: boolean

  /**
   * Util to manage votes and render vote manialink window
   * @param callerLogin Login of the player who called the vote
   * @param goal Ratio of votes needed to pass the vote (must be between 0 and 1)
   * @param seconds Amount of time to vote
   * @param options Optional parameters
   */
  constructor(callerLogin: string, goal: number, seconds: number, options?: { dontCancelOnRoundEnd?: true, dontCancelOnRoundStart?: true }) {
    if (goal <= 0 || goal >= 1) { throw new Error(`Vote goal has to be between 0 and 1`) }
    this.goal = goal
    this.votes.push({ login: callerLogin, vote: true })
    this.seconds = seconds
    this.cancelOnRoundEnd = options?.dontCancelOnRoundEnd === undefined
    this.cancelOnRoundStart = options?.dontCancelOnRoundStart === undefined
    if (Vote.isListenerAdded === false) {
      Vote.isListenerAdded = true
      tm.addListener('ManialinkClick', (info: tm.ManialinkClickInfo): void => Vote.listener(info))
      if (!['F5', 'F6', 'F7'].includes(config.yesKey)) {
        throw new Error(`Vote yesKey needs to be either F5, F6 or F7, received${config.yesKey}. Fix your vote config`)
      } else if (!['F5', 'F6', 'F7'].includes(config.noKey)) {
        throw new Error(`Vote noKey needs to be either F5, F6 or F7, received${config.noKey}. Fix your vote config`)
      }
      addKeyListener(config.yesKey as any, (info): void => Vote.listener({ ...info, actionId: this.yesId }), config.keyListenerImportance)
      addKeyListener(config.noKey as any, (info): void => Vote.listener({ ...info, actionId: this.noId }), config.keyListenerImportance)
      tm.commands.add(
        {
          aliases: config.commands.yes.aliases,
          help: config.commands.yes.help,
          callback: (info): void => tm.openManialink(this.yesId, info.login),
          privilege: config.commands.yes.privilege
        },
        {
          aliases: config.commands.no.aliases,
          help: config.commands.no.help,
          callback: (info): void => tm.openManialink(this.noId, info.login),
          privilege: config.commands.no.privilege
        },
        {
          aliases: config.commands.pass.aliases,
          help: config.commands.pass.help,
          callback: (info): void => {
            if (Vote.isDisplayed) {
              Vote.pass(info)
            }
          },
          privilege: config.commands.pass.privilege
        },
        {
          aliases: config.commands.cancel.aliases,
          help: config.commands.cancel.help,
          callback: (info): void => {
            if (Vote.isDisplayed) {
              Vote.cancel(info)
            }

          },
          privilege: config.commands.cancel.privilege
        }
      )
      tm.addListener("EndMap", (): void => Vote.endMapListener())
      tm.addListener('BeginMap', (): void => Vote.startMapListener())
    }
  }

  /**
   * Starts the vote timer and activates listeners
   * @param eligibleLogins List of logins of players that can vote
   * @returns False if there is another vote running, true if vote gets started successfully
   */
  start(eligibleLogins: string[]): boolean {
    if (Vote.isDisplayed === true) { return false }
    Vote.onEnd = this.onEnd
    Vote.onUpdate = this.onUpdate
    Vote.onInterrupt = this.onInterrupt
    Vote.onSecondsChanged = this.onSecondsChanged
    Vote.cancel = this.cancel.bind(this)
    Vote.pass = this.pass.bind(this)
    Vote.isDisplayed = true
    Vote.listener = (info: tm.ManialinkClickInfo): void => {
      if (this.isActive === true && this.loginList.includes(info.login)) {
        const vote = this.votes.find(a => a.login === info.login)
        if (vote === undefined) {
          if (info.actionId === this.yesId) { this.votes.push({ login: info.login, vote: true }) }
          else if (info.actionId === this.noId) { this.votes.push({ login: info.login, vote: false }) }
        } else {
          if (info.actionId === this.yesId) { vote.vote = true }
          else if (info.actionId === this.noId) { vote.vote = false }
        }
        Vote.onUpdate(this.votes, this.seconds, info)
      }
    }
    Vote.startMapListener = (): void => {
      if (this.cancelOnRoundStart) { this.cancel() }
    }
    Vote.endMapListener = (): void => {
      if (this.cancelOnRoundEnd) { this.cancel() }
    }
    const startTime: number = Date.now()
    this.isActive = true
    this.loginList = eligibleLogins
    const maxSeconds: number = this.seconds + 1
    const interval = setInterval((): void => {
      if (Date.now() > startTime + (maxSeconds - this.seconds) * 1000) {
        if (this.interrupted !== undefined) {
          clearInterval(interval)
          Vote.onInterrupt(this.interrupted, this.votes)
          this.clearListeners()
          Vote.isDisplayed = false
          return
        }
        if (this.votes.length === this.loginList.length) {
          Vote.onEnd(this.conclude(), this.votes)
          this.clearListeners()
          Vote.isDisplayed = false
          clearInterval(interval)
          return
        }
        this.seconds--
        if (this.seconds === -1) {
          Vote.onEnd(this.conclude(), this.votes)
          this.clearListeners()
          Vote.isDisplayed = false
          clearInterval(interval)
          return
        }
        Vote.onSecondsChanged(this.seconds, this.votes)
      }
    }, 200)
    return true
  }

  private conclude(): boolean {
    const allVotes: number = this.votes.length
    const yesVotes: number = this.votes.filter(a => a.vote === true).length
    this.isActive = false
    return (yesVotes / allVotes) > this.goal
  }

  /**
   * Passes the vote
   * @param caller Caller player object
   */
  pass(caller?: tm.Player): void {
    if (this.isActive === false) { return }
    this.interrupted = { caller, result: true }
  }

  /**
   * Cancels the vote
   * @param caller Caller player object
   */
  cancel(caller?: tm.Player): void {
    if (this.isActive === false) { return }
    this.interrupted = { caller, result: false }
  }

  private clearListeners(): void {
    Vote.onUpdate = () => undefined
    Vote.onEnd = () => undefined
    Vote.onInterrupt = () => undefined
    Vote.onSecondsChanged = () => undefined
    Vote.pass = () => undefined
    Vote.cancel = () => undefined
  }

}