export interface ButtonData {
  icon: string,
  text1: string,
  text2: string,
  iconWidth: number,
  iconHeight: number,
  padding: number,
  equalTexts?: boolean,
  actionId?: number,
  link?: string,
  /**
   * Enables per-player rendering. Buttons using per-player rendering should override the
   * `UiButton.renderForPlayer()` function (see `MedalButton.ts`)
   */
  perPlayer?: boolean
}