import RaceUi from "../config/RaceUi.js"
import ResultUi from "../config/ResultUi.js"

type DisplayMode = 'race' | 'result' | 'always' | 'none'

/**
 * Abstract class for static manialink components.
 */
export default abstract class StaticComponent {

  /** Events preset on which manialink gets displayed and hidden */
  readonly displayMode: DisplayMode
  private _isDisplayed: boolean = true
  /** Component manialink ID */
  readonly id: number
  private readonly dislayStates: { [mode in DisplayMode]: typeof tm.state.current[] } = {
    none: [],
    always: ['race', 'result', 'transition'],
    race: ['race', 'transition'],
    result: ['result']
  }
  private static readonly componentCreateListeners: ((component: StaticComponent) => void)[] = []

  /**
   * Abstract class for static manialink components
   * @param id Component manialink ID
   * @param displayMode Events preset on which manialink will get displayed and hidden
   */
  constructor(id: number, displayMode: DisplayMode) {
    this.id = id
    this.displayMode = displayMode
    tm.addListener('EndMap', (info) => {
      if(info.isRestart && info.winnerLogin === undefined) { return }
      this._isDisplayed = this.dislayStates[displayMode].includes(tm.state.current)
      this._isDisplayed ? this.display() : this.hide()
    }, true)
    tm.addListener('BeginMap', () => {
      this._isDisplayed = this.dislayStates[displayMode].includes(tm.state.current)
      this._isDisplayed ? this.display() : this.hide()
    }, true)
    tm.addListener('PlayerJoin', async (info: tm.JoinInfo) => {
      if (this._isDisplayed === true) { this.displayToPlayer(info.login) }
    })
    if (!this.dislayStates[displayMode].includes(tm.state.current)) {
      this._isDisplayed = false
    }
    for (const e of StaticComponent.componentCreateListeners) {
      e(this)
    }
  }

  /**
   * Gets position relative to other static manialinks based on config.
   * @returns Object containing coordinates and side of the component
   */
  protected getRelativePosition(): { x: number, y: number, side: boolean } {
    const widgetName = this.constructor.name
    let cfg: typeof RaceUi | typeof ResultUi
    if (this.displayMode === 'result') {
      cfg = ResultUi
    } else {
      cfg = RaceUi
    }
    let side = false
    if (cfg.rightSideOrder.some(a => a.name === widgetName)) { side = true }
    const order: { name: string; height: number; }[] = side ? cfg.rightSideOrder : cfg.leftSideOrder
    let positionSum: number = 0
    for (const e of order) {
      if (e.name === widgetName) { break }
      positionSum += e.height + cfg.marginBig
    }
    return { y: cfg.topBorder - positionSum, x: side === true ? cfg.rightPosition : cfg.leftPosition, side }
  }

  /**
   * Boolean indicating whether component should be displayed according to preset display mode.
   */
  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  /**
   * Displays the manialink to all the players
   * @param params Optional params
   */
  abstract display(params?: any): void

  /**
   * Displays the manialink to given player
   * @param login Player login
   * @param params Optional params
   */
  abstract displayToPlayer(login: string, params?: any): void

  /**
   * Hides the manialink for all players
   */
  hide(): void {
    this._isDisplayed = false
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

  /**
   * Add a callback function to execute when new component object gets created 
   * @param callback Function to execute on event
   */
  static onComponentCreated(callback: (component: StaticComponent) => void) {
    this.componentCreateListeners.push(callback)
  }

}
