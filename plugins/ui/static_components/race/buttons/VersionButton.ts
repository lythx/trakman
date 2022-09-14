import { ButtonData } from "./ButtonData.js";
import { UiButton } from "./UiButton.js";
import config from "./ButtonsWidget.config.js"
import { IDS } from '../../../UiUtils.js'
import { trakman as tm } from "../../../../../src/Trakman.js";

const cfg = config.versionButton

export class VersionButton extends UiButton {

  buttonData: ButtonData

  constructor() {
    super()
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0], { version: tm.config.version }),
      text2: cfg.texts[1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      actionId: IDS.changelog,
      equalTexts: cfg.texts.equal
    }
  }

}