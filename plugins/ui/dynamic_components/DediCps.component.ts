import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import {CONFIG as CFG } from '../UiUtils.js'

interface PlayerPage {
  readonly login: string
  page: number
}

export default class DediCps extends PopupWindow{

  readonly gridWidth = 5
  readonly gridHeight = 4
  private readonly challengeActionIds: string[] = []
  private readonly playerPages: PlayerPage[] = []

  initialize(): void {
  }

  protected constructHeader(login: string, params: any): string {
      return ''
  }

  protected constructContent(login: string): string {
    return ''
  }

  protected constructFooter(login: string): string {
    return ''
  }
} 