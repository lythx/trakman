import { type ButtonData } from './ButtonData.js'
import { UiButton } from './UiButton.js'
import userConfig from './ButtonsWidget.config.js'
import { componentIds } from '../../../UI.js'

const config = tm.utils.withDefaults(userConfig, {
  commandListButton: {
    texts: {
      0: 'COMMAND',
      1: '$AF4LIST',
      equal: true,
    },
    width: 1.8,
    height: 1.8,
    padding: 0.2,
  },
})

const cfg = config.commandListButton

export class CommandListButton extends UiButton {
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
      actionId: componentIds.commandList,
      equalTexts: cfg.texts.equal,
    }
  }
}
