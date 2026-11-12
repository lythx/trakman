import type { ButtonData } from './ButtonData.js'
import { UiButton } from './UiButton.js'
import userConfig from './ButtonsWidget.config.js'
import { componentIds } from '../../../UI.js'

const config = tm.utils.withDefaults(userConfig, {
  statsButton: {
    texts: {
      0: 'PLAYER',
      1: '$AF4STATS',
      equal: true,
    },
    width: 1.9,
    height: 1.9,
    padding: 0.2,
  },
})

const cfg = config.statsButton

export class StatsButton extends UiButton {
  buttonData: ButtonData

  constructor() {
    super()
    this.buttonData = {
      icon: cfg.icon,
      text1: cfg.texts[0],
      text2: cfg.texts[1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      actionId: componentIds.topRanks,
      equalTexts: cfg.texts.equal,
    }
  }
}
