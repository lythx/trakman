import type { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"

const cfg = config.visitCounter

export class VisitCounter extends UiButton {

  buttonData: ButtonData

  constructor() {
    super()
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0], { count: '0' }),
      text2: tm.utils.strVar(cfg.texts[1], { plural: '' }),
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      equalTexts: cfg.texts.equal
    }
    void this.initialize()
  }

  private async initialize(): Promise<void> {
    this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], { count: tm.players.totalCount.toString() })
    this.buttonData.text2 = tm.utils.strVar(cfg.texts[1], { plural: tm.players.totalCount > 1 ? 'S' : '' })
    void this.emitUpdate()
    tm.addListener('PlayerJoin', (info: tm.JoinInfo): void => {
      if (info.visits === 1) {
        const prevAmount: number = Number(this.buttonData.text1)
        this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], { count: (prevAmount + 1).toString() })
        tm.utils.strVar(cfg.texts[1], { plural: (prevAmount + 1) > 1 ? 'S' : '' })
        void this.emitUpdate()
      }
    })
  }

}