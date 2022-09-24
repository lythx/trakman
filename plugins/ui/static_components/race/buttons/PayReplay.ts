
import { ButtonData } from "./ButtonData.js";
import { UiButton } from "./UiButton.js";
import config from "./ButtonsWidget.config.js"
import { trakman as tm } from "../../../../../src/Trakman.js";

const cfg = config.payReplay

export class PayReplay extends UiButton {

  buttonData: ButtonData
  costIndex = 0
  isReplay = false
  isSkip = false
  parentId: number

  constructor(parentId: number) {
    super()
    this.parentId = parentId
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0][0], {
        cost: cfg.costs[0]
      }),
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
    this.onReplay(() => this.handleMapReplay())
    this.onSkip(() => this.handleMapSkip())
  }

  private handleClick = async (login: string, nickname: string): Promise<void> => {
    if (this.isReplay === true || this.isSkip === true) { return }
    const cost: number = cfg.costs[this.costIndex]
    if (cost === undefined) { return }
    const res: boolean | Error = await tm.utils.sendCoppers(login, cost, 'Pay to restart the ongoing map')
    if (res instanceof Error) {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to process payment.`, login)
    } else if (res === true) {
      if ((this.isReplay as boolean) === true || (this.isSkip as boolean) === true) {
        let returnMessage = '.'
        if (cost >= 75) { // Its not worth to return under 75 due to nadeo tax growing exponentially
          returnMessage = ', coppers will be returned.'
          void tm.utils.payCoppers(login, cost * 0.85, 'ad')
        }
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}The map got` +
          ` ${this.isReplay ? 'replayed' : 'skipped'} while processing the payment${returnMessage}`, login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(nickname)}${tm.utils.palette.donation}` +
        ` has paid ${tm.utils.palette.highlight}${cost}C ${tm.utils.palette.donation} to replay the ongoing map.`)
      tm.jukebox.add(tm.maps.current.id, { login, nickname }, true)
      this.costIndex++
      this.handleMapReplay()
      this.emitReplay()
    }
  }

  private handleMapStart(): void {
    if (this.isReplay === false) { this.costIndex = 0 }
    if (cfg.costs[this.costIndex] !== undefined) {
      this.buttonData = {
        icon: cfg.icon,
        text1: tm.utils.strVar(cfg.texts[0][0], {
          cost: cfg.costs[this.costIndex]
        }),
        text2: cfg.texts[0][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        equalTexts: cfg.texts[0].equal,
        actionId: cfg.actionId + this.parentId
      }
    } else {
      this.buttonData = {
        icon: cfg.icon,
        text1: cfg.texts[1][0],
        text2: cfg.texts[1][1],
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding,
        equalTexts: cfg.texts[1].equal
      }
    }
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