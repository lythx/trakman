import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import CFG from '../UIConfig.json' assert { type: 'json' }

export default class Jukebox extends PopupWindow implements IPopupWindow {

  readonly gridWidth = 5
  readonly gridHeight = 4

  constructContent(login: string): string {
    let xml = ''
    for (let i = 0; i < this.gridHeight; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        xml += `<quad posn="${j * 15.75} ${-i * 10.9} 0.01" sizen="14.5 10" action="58329582" style="BgsPlayerCard" substyle="BgRacePlayerName"/>` // TODO: manialink xml inside window here, for close button actionid use this.closeId
      }
    }
    return xml
  }
} 