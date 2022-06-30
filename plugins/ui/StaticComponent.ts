import { TRAKMAN as TM } from "../../src/Trakman.js"
import { CONFIG as CFG } from './UiUtils.js'

export default abstract class StaticComponent {

  protected _isDisplayed: boolean = false

  readonly id: number
  readonly displayMode: number
  private readonly displayModeListeners: TMEvent[][] = [
    [
      {
        event: 'Controller.PlayerJoin',
        callback: async (info: JoinInfo): Promise<void> => {
          if (this._isDisplayed)
            await this.displayToPlayer(info.login)
        }
      }
    ],
    [
      {
        event: 'TrackMania.EndChallenge',
        callback: (): void => { this.hide() }
      },
      {
        event: 'Controller.BeginMap',
        callback: async (): Promise<void> => { await this.display() }
      },
      {
        event: 'Controller.PlayerJoin',
        callback: async (info: JoinInfo): Promise<void> => {
          if (this._isDisplayed)
            await this.displayToPlayer(info.login)
        }
      }
    ],
    [
      {
        event: 'TrackMania.EndChallenge',
        callback: async (): Promise<void> => { await this.display() }
      },
      {
        event: 'Controller.BeginMap',
        callback: (): void => { this.hide() }
      },
      {
        event: 'Controller.PlayerJoin',
        callback: async (info: JoinInfo): Promise<void> => {
          if (this._isDisplayed)
            await this.displayToPlayer(info.login)
        }
      }
    ]
  ]

  constructor(id: number, displayMode: 'always' | 'race' | 'result') {
    this.displayMode = ['always', 'race', 'result', 'none'].indexOf(displayMode)
    this.id = id
    for (const e of this.displayModeListeners[this.displayMode]) { TM.addListener(e.event, e.callback) }
  }

  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  abstract display(): void | Promise<void>

  abstract displayToPlayer(login: string): void | Promise<void>

  hide(): void {
    this._isDisplayed = false
    TM.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
