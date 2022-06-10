import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import CFG from '../UIConfig.json' assert { type: 'json' }

export default class Jukebox extends PopupWindow implements IPopupWindow {

  constructContent(login: string): string {
    return `<quad posn="0 0 0.01" sizen="15.5 10" action="58329582" style="BgsPlayerCard" substyle="BgRacePlayerName"/>` // TODO: manialink xml inside window here, for close button actionid use this.closeId
  }

} 