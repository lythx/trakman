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
  manialink?: string,
  addPlayerId?: boolean
  /**
   * Enables per-player rendering. Buttons using per-player rendering should override the
   * `UiButton.renderForPlayer()` function (see `MedalButton.ts`)
   */
  perPlayer?: boolean
}