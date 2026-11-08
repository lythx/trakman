import type { ButtonData } from './ButtonData.js'
import { UiButton } from './UiButton.js'
import userConfig from './ButtonsWidget.config.js'

const config = tm.utils.withDefaults(userConfig, {
  timeButton: {
    texts: {
      0: '#{time}',
      1: '$AF4TIME',
      equal: false,
    },
    width: 1.8,
    height: 1.8,
    padding: 0.2,
  },
})

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
      equalTexts: cfg.texts.equal,
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
