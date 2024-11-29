import type { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import { VoteWindow } from "../../../UI.js"
import messages from './Messages.config.js'

const cfg = config.voteReplay
const msg = messages.voteReplay

export class VoteReplay extends UiButton {

  buttonData!: ButtonData
  replayCount = 0
  triesCount = 0
  failedVoteTimestamp = 0
  lastExtensionTimestamp = 0
  isReplay = false
  isSkip = false
  parentId: number

  constructor(parentId: number) {
    super()
    this.parentId = parentId
    this.displayDefaultButtonText()
    tm.commands.add({
      aliases: cfg.command.aliases,
      help: cfg.command.help,
      callback: info => {
        if (!tm.timer.isDynamic) {
          this.handleClick(info.login, info.nickname)
        } else {
          tm.sendMessage(msg.cantReplay, info.login)
        }
      },
      privilege: cfg.command.privilege
    })
    tm.commands.add({
      aliases: cfg.extendCommand.aliases,
      help: cfg.extendCommand.help,
      callback: info => {
        if (tm.timer.isDynamic) {
          this.handleClick(info.login, info.nickname)
        } else {
          tm.sendMessage(msg.cantExtend, info.login)
        }
      },
      privilege: cfg.extendCommand.privilege
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
    if (this.isReplay || this.isSkip) { return }
    const action = tm.timer.isDynamic ? msg.extendStr : msg.replayStr
    const autopass = tm.players.count === 1
    if (!autopass && tm.timer.remainingRaceTime <= cfg.minimumRemainingTime) {
      tm.sendMessage(tm.utils.strVar(msg.tooLate, { action }), login)
      return
    }
    if (!autopass && Date.now() - this.failedVoteTimestamp < cfg.timeout * 1000) {
      tm.sendMessage(msg.failedRecently, login)
      return
    }
    if (Date.now() - this.lastExtensionTimestamp < cfg.timeout * 1000) {
      tm.sendMessage(msg.extendedRecently, login)
      return
    }
    if (!autopass && this.triesCount >= cfg.triesLimit) {
      tm.sendMessage(msg.tooManyFailed, login)
      return
    }
    if (cfg.extensionsLimit !== 0 && this.replayCount >= cfg.extensionsLimit) {
      if (tm.timer.isDynamic) {
        tm.sendMessage(msg.tooManyExtensions, login)
      } else {
        tm.sendMessage(msg.tooManyReplays, login)
      }
      return
    }
    const startMsg: string = tm.utils.strVar(msg.start, { action, nickname: tm.utils.strip(nickname, true) })
    const header = tm.timer.isDynamic ? cfg.extendHeader : cfg.resHeader
    const voteWindow: VoteWindow = new VoteWindow(login, cfg.goal, header, startMsg, cfg.time, cfg.voteIcon)
    const result = await voteWindow.startAndGetResult(tm.players.list)
    if (result === undefined) {
      tm.sendMessage(msg.alreadyRunning, login)
      return
    }
    if (result === false) {
      this.failedVoteTimestamp = Date.now()
      this.triesCount++
      tm.sendMessage(tm.utils.strVar(msg.didntPass, { action }))
    } else if (result === true) {
      this.replayCount++
      if (!tm.timer.isDynamic) {
        this.isReplay = true
      } else {
        this.handleTimeExtension()
      }
      tm.sendMessage(tm.utils.strVar(msg.success, { action }))
      this.replayOrExtendTime()
    } else if (result.result === true) {
      this.replayCount++
      if (!tm.timer.isDynamic) {
        this.isReplay = true
      } else {
        this.handleTimeExtension()
      }
      if (result.caller === undefined) {
        tm.sendMessage(tm.utils.strVar(msg.success, { action }))
      } else {
        tm.sendMessage(tm.utils.strVar(msg.forcePass, {
          title: result.caller.title,
          nickname: tm.utils.strip(result.caller.nickname, true),
          action
        }))
      }
      this.replayOrExtendTime()
    } else {
      this.failedVoteTimestamp = Date.now()
      this.triesCount++
      if (result.caller === undefined) {
        tm.sendMessage(tm.utils.strVar(msg.cancelled, { action }))
      } else {
        tm.sendMessage(tm.utils.strVar(msg.cancelledBy, {
          title: result.caller.title,
          nickname: tm.utils.strip(result.caller.nickname, true),
          action
        }))
      }
    }
  }

  private replayOrExtendTime(): void {
    if (tm.timer.isDynamic) {
      tm.timer.addTime(cfg.timeExtension)
    } else {
      this.handleMapReplay()
      tm.jukebox.add(tm.maps.current.id, undefined, true)
    }
    this.emitReplay()
  }

  private handleMapStart(): void {
    if (tm.timer.isDynamic) {
      this.replayCount = 0
      this.isReplay = false
    } else if (!this.isReplay) {
      this.replayCount = 0
    }
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
      this.displayDefaultButtonText()
    }
    this.triesCount = 0
    this.isReplay = false
    this.isSkip = false
    this.failedVoteTimestamp = 0
    this.lastExtensionTimestamp = 0
    this.emitUpdate()
  }

  private displayDefaultButtonText() {
    if (tm.timer.isDynamic) {
      this.buttonData = {
        icon: cfg.icon,
        text1: cfg.texts[4][0],
        text2: cfg.texts[4][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        equalTexts: cfg.texts[4].equal,
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
  }

  private handleMapReplay(): void {
    if (tm.timer.isDynamic) {
      return
    }
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

  private handleTimeExtension(): void {
    this.lastExtensionTimestamp = Date.now()
    if (this.replayCount >= cfg.extensionsLimit) {
      this.buttonData.text1 = cfg.texts[5][0]
      this.buttonData.text2 = cfg.texts[5][1]
      this.buttonData.equalTexts = cfg.texts[5].equal
      this.buttonData.actionId = undefined
      this.emitUpdate()
    }
  }

}