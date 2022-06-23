import { TRAKMAN as TM } from "../../src/Trakman.js"
import { CONFIG as CFG } from './UiUtils.js'

export default abstract class StaticComponent {

  protected static readonly titleWidth = 15.5 - 0.8
  protected _isDisplayed: boolean = false

  readonly id: number
  readonly displayMode: number
  private readonly displayModeListeners: TMEvent[][] = [
    [
      {
        event: 'Controller.PlayerJoin',
        callback: (info: JoinInfo) => {
          if (this._isDisplayed)
            this.displayToPlayer(info.login)
        }
      }
    ],
    [
      {
        event: 'TrackMania.EndChallenge',
        callback: () => { this.hide() }
      },
      {
        event: 'Controller.BeginChallenge',
        callback: () => { this.display() }
      },
      {
        event: 'Controller.PlayerJoin',
        callback: (info: JoinInfo) => {
          if (this._isDisplayed)
            this.displayToPlayer(info.login)
        }
      }
    ],
    [
      {
        event: 'TrackMania.EndChallenge',
        callback: () => { this.display() }
      },
      {
        event: 'Controller.BeginChallenge',
        callback: () => { this.hide() }
      },
      {
        event: 'Controller.PlayerJoin',
        callback: (info: JoinInfo) => {
          if (this._isDisplayed)
            this.displayToPlayer(info.login)
        }
      }
    ]
  ]

  constructor(id: number, displayMode: 'always' | 'race' | 'result') {
    this.displayMode = ['always', 'race', 'result'].indexOf(displayMode)
    this.id = id
    for (const e of this.displayModeListeners[this.displayMode]) { TM.addListener(e.event, e.callback) }
  }

  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  abstract display(): void | Promise<void>

  abstract displayToPlayer(login: string): void

  hide(): void {
    this._isDisplayed = false
    TM.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
