
import { ButtonData } from "./ButtonData.js";
import { UiButton } from "./UiButton.js";
import config from "./ButtonsWidget.config.js"
import { trakman as tm } from "../../../../../src/Trakman.js";

const cfg = config.paySkip

export class PaySkip extends UiButton {

  buttonData: ButtonData
  isReplay = false
  isLastMapReplay = false
  isSkip = false
  parentId: number

  constructor(parentId: number) {
    super()
    this.parentId = parentId
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0][0], { cost: cfg.cost }),
      text2: cfg.texts[0][1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      actionId:cfg.actionId + this.parentId,
      equalTexts: cfg.texts[0].equal
    }
    tm.addListener('Controller.ManialinkClick', (info) => {
      if (info.answer === cfg.actionId + this.parentId) {
        void this.handleClick(info.login, info.nickname)
      }
    })
    tm.addListener('Controller.BeginMap', () => this.handleMapStart())
    this.onSkip(() => this.handleSkipNoCountdown())
    this.onReplay(() => this.handleReplay())
  }

  private handleClick = async (login: string, nickname: string): Promise<void> => {
    if (this.isLastMapReplay === true || this.isReplay === true
      || this.isSkip === true || tm.state.current === 'result') { return }
    const res: boolean | Error = await tm.utils.sendCoppers(login, cfg.cost, 'Pay to skip the ongoing map')
    if (res instanceof Error) {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to process payment.`)
    } else if (res === true) {
      let countDown: number = cfg.countdown
      const startTime: number = Date.now()
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(nickname)}${tm.utils.palette.donation} has paid ${tm.utils.palette.highlight}`
        + `${cfg.cost}C ${tm.utils.palette.donation}to skip the ongoing map. Skipping in ${tm.utils.palette.highlight}${countDown}s${tm.utils.palette.donation}.`)
      this.isSkip = true
      this.buttonData.text1 = cfg.texts[1][0]
      this.buttonData.text2 = tm.utils.strVar(cfg.texts[1][1], { seconds: countDown.toString() })
      this.emitUpdate()
      this.emitSkip()
      const interval = setInterval(async (): Promise<void> => {
        if (tm.state.current === 'result') {
          this.handleSkipNoCountdown()
          clearInterval(interval)
          return
        }
        if (Date.now() > startTime + 1000 * (cfg.countdown - countDown)) {
          countDown--
          this.buttonData.text2 = tm.utils.strVar(cfg.texts[1][1], { seconds: countDown.toString() })
          this.emitUpdate()
          if (countDown === 0) {
            tm.client.callNoRes('NextChallenge')
            this.handleSkipNoCountdown()
            clearInterval(interval)
          }
        }
      }, 100)
    }
  }

  private handleMapStart(): void {
    if (this.isReplay === false) {
      this.buttonData = {
        icon: cfg.icon,
        text1: tm.utils.strVar(cfg.texts[0][0], { cost: cfg.cost }),
        text2: cfg.texts[0][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        actionId:cfg.actionId + this.parentId,
        equalTexts: cfg.texts[0].equal
      }
      this.isLastMapReplay = false
    } else {
      this.buttonData = {
        icon: cfg.icon,
        text1: cfg.texts[2][0],
        text2: cfg.texts[2][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        equalTexts: cfg.texts[2].equal
      }
      this.isLastMapReplay = true
    }
    this.isSkip = false
    this.isReplay = false
    this.emitUpdate()
  }

  private handleReplay(): void {
    if (this.isReplay === true) { return }
    this.isReplay = true
    if (this.isSkip === true || this.isLastMapReplay === true) { return }
    this.buttonData.text1 = cfg.texts[2][0]
    this.buttonData.text2 = cfg.texts[2][1]
    this.buttonData.equalTexts = cfg.texts[2].equal
    this.buttonData.actionId = undefined
    this.emitUpdate()
  }

  private handleSkipNoCountdown(): void {
    if (this.isSkip === true) { return }
    this.isSkip = true
    this.buttonData.text1 = cfg.texts[3][0]
    this.buttonData.text2 = cfg.texts[3][1]
    this.buttonData.equalTexts = cfg.texts[3].equal
    this.buttonData.actionId = undefined
    this.emitUpdate()
  }

}