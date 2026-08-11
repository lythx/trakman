import type { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import { componentIds } from '../../../UI.js'

const cfg = config.favouriteButton

export class FavouriteButton extends UiButton {

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
      actionId: componentIds.favouriteButton,
      equalTexts: cfg.texts.equal,
      addPlayerId: true,
      manialink: `addfavorite?action=add&amp;server=${tm.config.server.login}&amp;name=${encodeURIComponent(tm.config.server.name)}&amp;zone=${encodeURIComponent(tm.config.server.zone)}`
    }
  }

}