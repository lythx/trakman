import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import CFG from '../UIConfig.json' assert { type: 'json' }

interface PlayerPage {
  readonly login: string
  page: number
}

export default class DediCps extends PopupWindow implements IPopupWindow {

  readonly gridWidth = 5
  readonly gridHeight = 4
  private readonly challengeActionIds: string[] = []
  private readonly playerPages: PlayerPage[] = []

  initialize(): void {
  }

  constructContent(login: string): string {
    return ''
  }

  constructFooter(login: string): string {
    return ''
  }
} 