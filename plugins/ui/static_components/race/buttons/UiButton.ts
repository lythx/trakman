import type { ButtonData } from "./ButtonData.js"

export abstract class UiButton {

  abstract buttonData: ButtonData
  private static readonly replayListeners: ((buttonName: string) => void)[] = []
  private static readonly updateListeners: ((buttonData: ButtonData) => void)[] = []
  private static readonly skipListeners: ((buttonName: string) => void)[] = []

  static onUpdate(callback: (buttonData: ButtonData) => void) {
    this.updateListeners.push(callback)
  }

  protected emitUpdate() {
    for (const e of UiButton.updateListeners) {
      e(this.buttonData)
    }
  }

  protected emitReplay() {
    for (const e of UiButton.replayListeners) {
      e(this.constructor.name)
    }
  }

  protected emitSkip() {
    for (const e of UiButton.skipListeners) {
      e(this.constructor.name)
    }
  }

  protected onReplay(callback: (buttonName: string) => void) {
    UiButton.replayListeners.push(callback)
  }

  protected onSkip(callback: (buttonName: string) => void) {
    UiButton.skipListeners.push(callback)
  }

}