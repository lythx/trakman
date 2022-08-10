import { trakman as TM } from "../../src/Trakman.js"

export default abstract class StaticComponent {

  displayMode: 'race' | 'result' | 'always' | 'none'
  private _isDisplayed: boolean = true
  readonly id: number

  constructor(id: number, displayMode: 'race' | 'result' | 'always' | 'none') {
    this.id = id
    this.displayMode = displayMode
    switch (displayMode) {
      case 'race':
        TM.addListener('Controller.BeginMap', async () => {
          this._isDisplayed = true
          await this.display()
        })
        TM.addListener('Controller.EndMap', () => {
          this._isDisplayed = false
          this.hide()
        }, true)
        break
      case 'result':
        TM.addListener('Controller.EndMap', async () => {
          this._isDisplayed = true
          await this.display()
        })
        TM.addListener('Controller.BeginMap', () => {
          this._isDisplayed = false
          this.hide()
        }, true)
    }
    TM.addListener('Controller.PlayerJoin', async (info: JoinInfo) => {
      if (this._isDisplayed === true) { await this.displayToPlayer(info.login) }
    })
    if (TM.state.current !== this.displayMode && this.displayMode !== 'always') {
      this._isDisplayed = false
    }
  }

  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  abstract display(params?: any): void | Promise<void>

  abstract displayToPlayer(login: string, params?: any): void | Promise<void>

  hide(): void {
    this._isDisplayed = false
    TM.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
