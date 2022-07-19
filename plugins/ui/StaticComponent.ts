import { TRAKMAN as TM } from "../../src/Trakman.js"

export default abstract class StaticComponent {

  protected _isDisplayed: boolean = false
  readonly id: number

  constructor(id: number, display?: { displayOnRace?: true, displayOnResult?: true, hideOnRace?: true, hideOnResult?: true }) {
    this.id = id
    if (display?.displayOnRace === true) {
      TM.addListener('Controller.BeginMap', async () => { await this.display() })
    }
    if (display?.displayOnResult === true) {
      TM.addListener('Controller.EndMap', async () => { await this.display() })
    }
    if (display?.hideOnRace === true) {
      TM.addListener('Controller.BeginMap', () => { this.hide() })
    }
    if (display?.hideOnResult === true) {
      TM.addListener('Controller.EndMap', () => { this.hide() })
    }
    TM.addListener('Controller.PlayerJoin', async (info: JoinInfo) => {
      if (this._isDisplayed) { await this.displayToPlayer(info.login) }
    })
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
