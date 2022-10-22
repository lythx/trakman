import { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import { VoteWindow } from "../../../UiUtils.js"
import messages from './Messages.config.js'

const cfg = config.voteReplay
const msg = messages.voteReplay

export class VoteReplay extends UiButton {

  buttonData: ButtonData
  replayCount = 0
  triesCount = 0
  failedVoteTimestamp = 0
  isReplay = false
  isSkip = false
  parentId: number

  constructor(parentId: number) {
    super()
    this.parentId = parentId
    this.buttonData = {
      icon: cfg.icon,
      text1: cfg.texts[0][0],
      text2: cfg.texts[0][1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      actionId: cfg.actionId + this.parentId,
      equalTexts: cfg.texts[0].equal
    }
    tm.commands.add({
      aliases: ['r', 'res', 'replay'],
      help: 'Start a vote to replay the ongoing map',
      callback: info => {
        this.handleClick(info.login, info.nickname)
      },
      privilege: 0
    })
    tm.addListener('ManialinkClick', (info) => {
      if (info.actionId === cfg.actionId + this.parentId) {
        void this.handleClick(info.login, info.nickname)
      }
    })
    tm.addListener('BeginMap', () => this.handleMapStart())
    this.onReplay(() => this.handleMapReplay())
    this.onSkip(() => this.handleMapSkip())
  }

  private async handleClick(login: string, nickname: string): Promise<void> {
    if (this.isReplay === true || this.isSkip === true) { return }
    if (tm.state.remainingMapTime <= cfg.minimumRemainingTime) {
      tm.sendMessage(msg.tooLate, login)
      return
    }
    if (Date.now() / 1000 - this.failedVoteTimestamp < cfg.timeout) {
      tm.sendMessage(msg.failedRecently, login)
      return
    }
    if (this.triesCount >= cfg.triesLimit) {
      tm.sendMessage(msg.tooManyFailed, login)
      return
    }
    const startMsg: string = tm.utils.strVar(msg.start, { nickname: tm.utils.strip(nickname, true) })
    const voteWindow: VoteWindow = new VoteWindow(login, cfg.goal, cfg.header, startMsg, cfg.time, cfg.voteIcon)
    const result = await voteWindow.startAndGetResult(tm.players.list.map(a => a.login))
    if (result === undefined) {
      tm.sendMessage(msg.alreadyRunning, login)
      return
    }
    if (result === false) {
      this.failedVoteTimestamp = Date.now()
      this.triesCount++
      tm.sendMessage(msg.didntPass)
    } else if (result === true) {
      this.replayCount++
      this.isReplay = true
      this.handleMapReplay()
      this.emitReplay()
      tm.sendMessage(msg.success)
      tm.jukebox.add(tm.maps.current.id, { login, nickname }, true)
    } else if (result.result === true) {
      this.replayCount++
      this.isReplay = true
      this.handleMapReplay()
      this.emitReplay()
      if (result.caller === undefined) {
        tm.sendMessage(msg.success)
      } else {
        tm.sendMessage(tm.utils.strVar(msg.forcePass, {
          title: result.caller.title,
          nickname: tm.utils.strip(result.caller.nickname, true)
        }))
        tm.jukebox.add(tm.maps.current.id, undefined, true)
      }
    } else {
      this.failedVoteTimestamp = Date.now()
      this.triesCount++
      if (result.caller === undefined) {
        tm.sendMessage(msg.cancelled)
      } else {
        tm.sendMessage(tm.utils.strVar(msg.cancelledBy, {
          title: result.caller.title,
          nickname: tm.utils.strip(result.caller.nickname, true)
        }))
      }
    }
  }

  private handleMapStart(): void {
    if (this.isReplay === false) { this.replayCount = 0 }
    if (this.replayCount >= cfg.replayLimit) {
      this.buttonData = {
        icon: cfg.icon,
        text1: cfg.texts[1][0],
        text2: cfg.texts[1][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        equalTexts: cfg.texts[1].equal,
        actionId: cfg.actionId + this.parentId
      }
    } else {
      this.buttonData = {
        icon: cfg.icon,
        text1: cfg.texts[0][0],
        text2: cfg.texts[0][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        equalTexts: cfg.texts[0].equal,
        actionId: cfg.actionId + this.parentId
      }
    }
    this.triesCount = 0
    this.isReplay = false
    this.isSkip = false
    this.emitUpdate()
  }

  private handleMapReplay(): void {
    this.isReplay = true
    this.buttonData.text1 = cfg.texts[2][0]
    this.buttonData.text2 = cfg.texts[2][1]
    this.buttonData.equalTexts = cfg.texts[2].equal
    this.buttonData.actionId = undefined
    this.emitUpdate()
  }

  private handleMapSkip(): void {
    this.isSkip = true
    this.buttonData.text1 = cfg.texts[3][0]
    this.buttonData.text2 = cfg.texts[3][1]
    this.buttonData.equalTexts = cfg.texts[3].equal
    this.buttonData.actionId = undefined
    this.emitUpdate()
  }

}