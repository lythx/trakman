import type { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import { componentIds } from '../../../UI.js'

const cfg = config.mapsButton

export class MapsButton extends UiButton {

  buttonData: ButtonData

  constructor() {
    super()
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0], { count: tm.maps.count.toString() }),
      text2: cfg.texts[1],
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      actionId: componentIds.mapList,
      equalTexts: cfg.texts.equal
    }
    tm.addListener(['MapAdded', 'MapRemoved'], (): void => {
      this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], { count: tm.maps.count.toString() })
      this.emitUpdate()
    })
  }

}