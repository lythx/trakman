import { ButtonData } from "./ButtonData.js"
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
    const res: { count: number }[] | Error = await tm.db.query('SELECT count(*)::int FROM players;')
    if (res instanceof Error) {
      await tm.log.fatal('Failed to fetch players from database.', res.message, res.stack)
      return
    }
    this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], { count: res[0].count.toString() })
    this.buttonData.text2 = tm.utils.strVar(cfg.texts[1], { plural: res[0].count > 1 ? 'S' : '' })
    void this.emitUpdate()
    tm.addListener('PlayerJoin', (info: JoinInfo): void => {
      if (info.visits === 0) {
        const prevAmount: number = Number(this.buttonData.text1)
        this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], { count: (prevAmount + 1).toString() })
        tm.utils.strVar(cfg.texts[1], { plural: (prevAmount + 1) > 1 ? 'S' : '' })
        void this.emitUpdate()
      }
    })
  }

}