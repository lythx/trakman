import { type ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import { componentIds } from '../../../UI.js'

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
      equalTexts: cfg.texts.equal
    }
  }

}   