import RaceUi from "./config/RaceUi.js"
import ResultUi from "./config/ResultUi.js"

type DisplayMode = 'race' | 'result' | 'always' | 'none'

export default abstract class StaticComponent {

  displayMode: DisplayMode
  private _isDisplayed: boolean = true
  readonly id: number
  readonly dislayStates: { [mode in DisplayMode]: typeof tm.state.current[] } = {
    none: [],
    always: ['race', 'result', 'transition'],
    race: ['race', 'transition'],
    result: ['result']
  }

  constructor(id: number, displayMode: DisplayMode) {
    this.id = id
    this.displayMode = displayMode
    tm.addListener(['EndMap', 'BeginMap'], () => {
      this._isDisplayed = this.dislayStates[displayMode].includes(tm.state.current)
      this._isDisplayed ? this.display() : this.hide()
    }, true)
    tm.addListener('PlayerJoin', async (info: tm.JoinInfo) => {
      if (this._isDisplayed === true) { this.displayToPlayer(info.login) }
    })
    if (!this.dislayStates[displayMode].includes(tm.state.current)) {
      this._isDisplayed = false
    }
  }

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

  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  abstract display(params?: any): void

  abstract displayToPlayer(login: string, params?: any): void

  hide(): void {
    this._isDisplayed = false
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
