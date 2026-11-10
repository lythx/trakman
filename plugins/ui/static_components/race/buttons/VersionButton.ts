import type { ButtonData } from './ButtonData.js'
import { UiButton } from './UiButton.js'
import userConfig from './ButtonsWidget.config.js'
import { componentIds } from '../../../UI.js'

const config = tm.utils.withDefaults(userConfig, {
  versionButton: {
    texts: {
      0: '#{version}',
      1: '$AF4VERSION',
      equal: false,
    },
    width: 1.8,
    height: 1.8,
    padding: 0.3,
  },
})

const cfg = config.versionButton

export class VersionButton extends UiButton {
  buttonData: ButtonData

  constructor() {
    super()
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0], { version: tm.config.controller.version }),
      text2: cfg.texts[1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      actionId: componentIds.changelog,
      equalTexts: cfg.texts.equal,
    }
  }
}
