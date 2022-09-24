
import { ButtonData } from "./ButtonData.js";
import { UiButton } from "./UiButton.js";
import config from "./ButtonsWidget.config.js"
import { trakman as tm } from "../../../../../src/Trakman.js";
import { VoteWindow } from "../../../UiUtils.js";

const cfg = config.voteReplay

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
      aliases: ['s', 'skip'],
      help: 'Start a vote to skip the ongoing map',
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
      tm.sendMessage(`${tm.utils.palette.error}It's too late for replay vote.`, login)
      return
    }
    if (Date.now() / 1000 - this.failedVoteTimestamp < cfg.timeout) {
      tm.sendMessage(`${tm.utils.palette.error}Vote failed recently, wait a bit.`, login)
      return
    }
    if (this.triesCount >= cfg.triesLimit) {
      tm.sendMessage(`${tm.utils.palette.error}Too many votes failed.`, login)
      return
    }
    const startMsg: string = `${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(nickname)} `
      + `${tm.utils.palette.vote}started a vote to ${tm.utils.palette.highlight}replay ${tm.utils.palette.vote}the ongoing map.`
    const voteWindow: VoteWindow = new VoteWindow(login, cfg.goal,
      `${tm.utils.palette.highlight}Vote to ${tm.utils.palette.tmGreen}REPLAY${tm.utils.palette.highlight} the ongoing map`,
      startMsg, cfg.time, cfg.voteIcon)
    const result = await voteWindow.startAndGetResult(tm.players.list.map(a => a.login))
    if (result === undefined) {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}A vote is already running.`, login)
      return
    }
    if (result === false) {
      this.failedVoteTimestamp = Date.now()
      this.triesCount++
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.vote}Vote to ${tm.utils.palette.highlight}replay `
        + `${tm.utils.palette.vote}the ongoing map ${tm.utils.palette.highlight}did not pass${tm.utils.palette.vote}.`)
    } else if (result === true) {
      this.replayCount++
      this.isReplay = true
      this.handleMapReplay()
      this.emitReplay()
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.vote}Vote to ${tm.utils.palette.highlight}replay `
        + `${tm.utils.palette.vote}the ongoing map ${tm.utils.palette.highlight}has passed${tm.utils.palette.vote}.`)
      tm.jukebox.add(tm.maps.current.id, { login, nickname }, true)
    } else if (result.result === true) {
      this.replayCount++
      this.isReplay = true
      this.handleMapReplay()
      this.emitReplay()
      if (result.caller === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin} Vote to replay the ongoing map passed.`)
      } else {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(result.caller)} `
          + `${tm.utils.palette.highlight + tm.utils.strip(result.caller.nickname, true)}${tm.utils.palette.admin} has passed the vote to replay the ongoing map.`)
        tm.jukebox.add(tm.maps.current.id, undefined, true)
      }
    } else {
      this.failedVoteTimestamp = Date.now()
      this.triesCount++
      if (result.caller === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin} Vote to replay the ongoing map was cancelled.`)
      } else {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(result.caller)} `
          + `${tm.utils.palette.highlight + tm.utils.strip(result.caller.nickname, true)}${tm.utils.palette.admin} has cancelled the vote to replay the ongoing map.`)
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