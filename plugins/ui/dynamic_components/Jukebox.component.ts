import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import CFG from '../UIConfig.json' assert { type: 'json' }

export default class Jukebox extends PopupWindow implements IPopupWindow {

  constructContent(login: string): string {
    return `` // TODO: manialink xml inside window here, for close button actionid use this.closeId
  }

} 