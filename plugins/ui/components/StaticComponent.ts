import IStaticComponent from "./StaticComponent.interface";
import { TRAKMAN as TM } from "../../../src/Trakman.js"
import CFG from '../UIConfig.json' assert { type: 'json' }

type DisplayMode = 'always' | 'race' | 'result'

export default abstract class StaticComponent implements IStaticComponent {

  protected static readonly titleWidth = CFG.localRecordsWidget.width - 0.8
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
        callback: () => { this.close() }
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
        callback: () => { this.close() }
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

  constructor(displayMode: DisplayMode, id: number) {
    this.displayMode = ['always', 'race', 'result'].indexOf(displayMode)
    this.id = id
    for (const e of this.displayModeListeners[this.displayMode]) { TM.addListener(e.event, e.callback) }
  }

  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(
      `<manialink id="1">
        <label posn="0 0 0" sizen="100 0" 
         halign="center" textsize="5" text="display method for manialink id ${this.id} not implemented"/> 
        <format textsize="5" textcolor="F00F"/>
      </manialink>`
    )
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(
      `<manialink id="1">
        <label posn="0 0 0" sizen="100 0" 
         halign="center" textsize="5" text="displayToPlayer method for manialink id ${this.id} not implemented"/> 
        <format textsize="5" textcolor="F00F"/>
      </manialink>`,
      login)
  }

  close(): void {
    this._isDisplayed = false
    TM.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
