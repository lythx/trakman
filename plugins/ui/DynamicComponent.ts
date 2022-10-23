/**
 * Abstract class for dynamic manialink components
 */
export default abstract class DynamicComponent {

  /**
   * Component manialink ID
   */
  readonly id: number

  /**
   * Abstract class for dynamic manialink components
   * @param id Component manialink ID
   */
  constructor(id: number) {
    this.id = id
  }

  /**
   * Displays the manialink to given player
   * @param login Player login
   */
  abstract displayToPlayer(login: string): void

  /**
   * Hides the manialink for given player
   * @param login Player login
   */
  hideToPlayer(login: string): void {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`, login)
  }

}