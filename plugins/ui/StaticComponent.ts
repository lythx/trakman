import RaceUi from "./config/RaceUi.js"
import ResultUi from "./config/ResultUi.js"

export default abstract class StaticComponent {

  displayMode: 'race' | 'result' | 'always' | 'none'
  private _isDisplayed: boolean = true
  readonly id: number

  constructor(id: number, displayMode: 'race' | 'result' | 'always' | 'none') {
    this.id = id
    this.displayMode = displayMode
    switch (displayMode) {
      case 'race':
        tm.addListener('BeginMap', async () => {
          this._isDisplayed = true
          await this.display()
        })
        tm.addListener('EndMap', () => {
          this._isDisplayed = false
          this.hide()
        }, true)
        break
      case 'result':
        tm.addListener('EndMap', async () => {
          this._isDisplayed = true
          await this.display()
        })
        tm.addListener('BeginMap', () => {
          this._isDisplayed = false
          this.hide()
        }, true)
    }
    tm.addListener('PlayerJoin', async (info: JoinInfo) => {
      if (this._isDisplayed === true) { await this.displayToPlayer(info.login) }
    })
    if (tm.state.current !== this.displayMode && this.displayMode !== 'always') {
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

  abstract display(params?: any): void | Promise<void>

  abstract displayToPlayer(login: string, params?: any): void | Promise<void>

  hide(): void {
    this._isDisplayed = false
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
