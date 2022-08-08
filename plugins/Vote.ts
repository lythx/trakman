import { trakman as TM } from "../src/Trakman.js"
import { addKeyListener } from "./ui/utils/KeyListener.js"
import IDS from './ui/config/UtilIds.json' assert { type: 'json' }

export class Vote {

  private static isListenerAdded: boolean = false
  private static isDisplayed: boolean = false
  readonly yesId: number = IDS.VoteWindow.voteYes
  readonly noId: number = IDS.VoteWindow.voteNo
  readonly goal: number
  private readonly votes: { login: string, vote: boolean }[] = []
  static listener: ((info: ManialinkClickInfo) => void) = () => undefined
  static endMapListener: () => void = () => undefined
  static startMapListener: () => void = () => undefined
  static onUpdate: ((votes: { login: string, vote: boolean }[], seconds: number, info: ManialinkClickInfo) => void) = () => undefined
  static onEnd: ((result: boolean, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  static onInterrupt: ((info: {
    callerLogin?: string;
    result: boolean;
  }, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  static onSecondsChanged: ((seconds: number, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  onUpdate: ((votes: { login: string, vote: boolean }[], seconds: number, info: ManialinkClickInfo) => void) = () => undefined
  onEnd: ((result: boolean, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  onInterrupt: ((info: {
    callerLogin?: string;
    result: boolean;
  }, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  onSecondsChanged: ((seconds: number, votes: { login: string, vote: boolean }[]) => void) = () => undefined
  loginList: string[] = []
  private isActive: boolean = false
  private seconds: number
  private interrupted: { callerLogin?: string, result: boolean } | undefined
  private readonly cancelOnRoundEnd: boolean
  private readonly cancelOnRoundStart: boolean

  constructor(callerLogin: string, goal: number, seconds: number, dontCancelOnRoundEnd?: true, dontCancelOnRoundStart?: true) {
    this.goal = goal
    this.votes.push({ login: callerLogin, vote: true })
    this.seconds = seconds
    this.cancelOnRoundEnd = dontCancelOnRoundEnd === undefined
    this.cancelOnRoundStart = dontCancelOnRoundStart === undefined
    if (Vote.isListenerAdded === false) {
      Vote.isListenerAdded = true
      TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo): void => Vote.listener(info))
      addKeyListener('F5', (info): void => Vote.listener({ ...info, answer: this.yesId }), 1, 'voteYes')
      addKeyListener('F6', (info): void => Vote.listener({ ...info, answer: this.noId }), 1, 'voteNo')
      TM.commands.add({
        aliases: ['y', 'yes'],
        callback: (info): void => TM.openManialink(this.yesId, info.login),
        privilege: 0
      })
      TM.commands.add({
        aliases: ['n', 'no'],
        callback: (info): void => TM.openManialink(this.noId, info.login),
        privilege: 0
      })
      TM.addListener("Controller.EndMap", (): void => Vote.endMapListener())
      TM.addListener('Controller.BeginMap', (): void => Vote.startMapListener())
    }
  }

  /**
   * @param eligibleLogins list of logins of players that can vote
   * @returns undefined if there is another vote running, Error with reason if someone cancelled the vote or vote result
   */
  start(eligibleLogins: string[]): true | false {
    if (Vote.isDisplayed === true) { return false }
    Vote.onUpdate = this.onUpdate
    Vote.onEnd = this.onEnd
    Vote.onInterrupt = this.onInterrupt
    Vote.onSecondsChanged = this.onSecondsChanged
    Vote.isDisplayed = true
    Vote.listener = (info: ManialinkClickInfo): void => {
      if (this.isActive === true && this.loginList.includes(info.login)) {
        const vote = this.votes.find(a => a.login === info.login)
        if (vote === undefined) {
          if (info.answer === this.yesId) { this.votes.push({ login: info.login, vote: true }) }
          else if (info.answer === this.noId) { this.votes.push({ login: info.login, vote: false }) }
        } else {
          if (info.answer === this.yesId) { vote.vote = true }
          else if (info.answer === this.noId) { vote.vote = false }
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
        this.seconds--
        if (this.seconds === -1) {
          Vote.onEnd(this.conclude(), this.votes)
          this.clearListeners()
          clearInterval(interval)
          Vote.isDisplayed = false
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

  pass(callerLogin?: string): void {
    if (this.isActive === false) { return }
    this.interrupted = { callerLogin, result: true }
  }

  cancel(callerLogin?: string): void {
    if (this.isActive === false) { return }
    this.interrupted = { callerLogin, result: false }
  }

  clearListeners(): void {
    Vote.onUpdate = () => undefined
    Vote.onEnd = () => undefined
    Vote.onInterrupt = () => undefined
    Vote.onSecondsChanged = () => undefined
  }

}