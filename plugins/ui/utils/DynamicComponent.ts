/**
 * Abstract class for dynamic manialink components.
 */
export default abstract class DynamicComponent {

  /**
   * Component manialink ID
   */
  readonly id: number
  private static readonly componentCreateListeners: ((component: DynamicComponent) => void)[] = []

  /**
   * Abstract class for dynamic manialink components
   * @param id Component manialink ID
   */
  constructor(id: number) {
    this.id = id
    for (const e of DynamicComponent.componentCreateListeners) {
      e(this)
    }
  }

  /**
   * Displays the manialink to given player
   * @param login Player login
   * @param params Optional params
   */
  abstract displayToPlayer(login: string, params?: any): void

  /**
   * Hides the manialink for given player
   * @param login Player login
   */
  hideToPlayer(login: string): void {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`, login)
  }

  /**
   *  Add a callback function to execute when new component object gets created 
   * @param callback Function to execute on event
   */
  static onComponentCreated(callback: (component: DynamicComponent) => void) {
    this.componentCreateListeners.push(callback)
  }

}