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
  private readonly dislayStates: { [mode in DisplayMode]: ReturnType<typeof tm.getState>[] } = {
    none: [],
    always: ['race', 'result', 'transition'],
    race: ['race', 'transition'],
    result: ['result']
  }
  private static readonly componentCreateListeners: ((component: StaticComponent) => void)[] = []
  protected positionY: number
  protected positionX: number
  protected side: boolean
  gameModes: tm.GameMode[] // todo make getter

  /**
   * Abstract class for static manialink components
   * @param id Component manialink ID
   * @param displayMode Events preset on which manialink will get displayed and hidden
   */
  constructor(id: number, displayMode: DisplayMode, gameModes: tm.GameMode[] = ['Cup', 'Rounds', 'Stunts', 'Teams', 'Laps', 'TimeAttack']) {
    this.id = id
    this.displayMode = displayMode
    this.gameModes = gameModes
    tm.addListener('EndMap', (info): void => {
      if (!gameModes.includes(tm.getGameMode())) {
        this.hide()
        this._isDisplayed = false
        return
      }
      if (info.isRestart && info.serverSideRankings[0]?.BestTime === -1) { return } // ignore the short restart
      this._isDisplayed = this.dislayStates[displayMode].includes(tm.getState())
      this._isDisplayed ? this.display() : this.hide()
    }, true)
    tm.addListener('BeginMap', (): void => {
      this._isDisplayed = this.dislayStates[displayMode].includes(tm.getState())
      if (!gameModes.includes(tm.getGameMode())) { this._isDisplayed = false }
      this._isDisplayed ? this.display() : this.hide()
    }, true)
    tm.addListener('PlayerJoin', async (info: tm.JoinInfo): Promise<void> => {
      if (this._isDisplayed === true) { this.displayToPlayer(info.login) }
    })
    if (!this.dislayStates[displayMode].includes(tm.getState())
      || !gameModes.includes(tm.getGameMode())) {
      this._isDisplayed = false
    }
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    for (const e of StaticComponent.componentCreateListeners) {
      e(this)
    }
  }

  updatePosition() {
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.onPositionChange()
  }

  protected onPositionChange() {
    this.display()
  }

  /**
   * Gets position relative to other static manialinks based on config.
   * @returns Object containing coordinates and side of the component
   */
  private getRelativePosition(): { x: number, y: number, side: boolean } {
    const widgetName: string = this.constructor.name
    let cfg
    let left, right
    if (this.displayMode === 'result') {
      cfg = ResultUi
      left = cfg.leftSideOrder
      right = cfg.rightSideOrder
    } else {
      cfg = RaceUi
      switch (tm.getGameMode()) {
        case "Rounds":
          left = cfg.roundsLeftSideOrder
          right = cfg.roundsRightSideOrder
          break
        case "Teams":
          left = cfg.teamsLeftSideOrder
          right = cfg.teamsRightSideOrder
          break
        case "Cup":
          left = cfg.cupLeftSideOrder
          right = cfg.cupRightSideOrder
          break
        case "Laps":
          left = cfg.lapsLeftSideOrder
          right = cfg.lapsRightSideOrder
          break
        default:
          left = cfg.leftSideOrder
          right = cfg.rightSideOrder
      }
    }
    let side: boolean = false
    if (right.some(a => a.name === widgetName)) { side = true }
    const order: { name: string; height: number; }[] = side ? right : left
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
