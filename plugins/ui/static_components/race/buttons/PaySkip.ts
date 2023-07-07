import { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import messages from "./Messages.config.js"

const msg = messages.paySkip
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
      actionId: cfg.actionId + this.parentId,
      equalTexts: cfg.texts[0].equal
    }
    tm.addListener('ManialinkClick', (info) => {
      if (info.actionId === cfg.actionId + this.parentId) {
        void this.handleClick(info.login, info.nickname)
      }
    })
    tm.addListener('BeginMap', () => this.handleMapStart())
    this.onSkip(() => this.handleSkipNoCountdown())
    this.onReplay(() => this.handleReplay())
  }

  private handleClick = async (login: string, nickname: string): Promise<void> => {
    if (this.isLastMapReplay || this.isReplay
      || this.isSkip || tm.getState() === 'result') { return }
    const res: boolean | Error = await tm.utils.sendCoppers(login, cfg.cost, cfg.billMessage)
    if (res instanceof Error) {
      tm.sendMessage(msg.paymentFail, login)
    } else if (res === true) {
      let countDown: number = cfg.countdown
      const startTime: number = Date.now()
      tm.sendMessage(tm.utils.strVar(msg.success, {
        name: tm.utils.strip(nickname),
        amount: cfg.cost,
        seconds: countDown
      }))
      this.isSkip = true
      this.buttonData.text1 = cfg.texts[1][0]
      this.buttonData.text2 = tm.utils.strVar(cfg.texts[1][1], { seconds: countDown.toString() })
      this.emitUpdate()
      this.emitSkip()
      const interval = setInterval(async (): Promise<void> => {
        if (tm.getState() === 'result') {
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
    if (!this.isReplay) {
      this.buttonData = {
        icon: cfg.icon,
        text1: tm.utils.strVar(cfg.texts[0][0], { cost: cfg.cost }),
        text2: cfg.texts[0][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        actionId: cfg.actionId + this.parentId,
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
    if (this.isReplay) { return }
    this.isReplay = true
    if (this.isSkip || this.isLastMapReplay) { return }
    this.buttonData.text1 = cfg.texts[2][0]
    this.buttonData.text2 = cfg.texts[2][1]
    this.buttonData.equalTexts = cfg.texts[2].equal
    this.buttonData.actionId = undefined
    this.emitUpdate()
  }

  private handleSkipNoCountdown(): void {
    if (this.isSkip) { return }
    this.isSkip = true
    this.buttonData.text1 = cfg.texts[3][0]
    this.buttonData.text2 = cfg.texts[3][1]
    this.buttonData.equalTexts = cfg.texts[3].equal
    this.buttonData.actionId = undefined
    this.emitUpdate()
  }

}