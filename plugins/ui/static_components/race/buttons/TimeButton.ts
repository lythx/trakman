import type { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"

const cfg = config.timeButton

export class TimeButton extends UiButton {

  buttonData: ButtonData

  constructor() {
    super()
    let timeString: string = this.getTimeString()
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0], { time: timeString }),
      text2: cfg.texts[1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      equalTexts: cfg.texts.equal
    }
    setInterval((): void => {
      const newTimeString: string = this.getTimeString()
      if (timeString !== newTimeString) {
        timeString = newTimeString
        this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], { time: timeString })
        this.emitUpdate()
      }
    }, 1000)
  }

  private getTimeString(): string {
    return `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
  }

}