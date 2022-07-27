import { getStaticPosition, centeredText, RecordList, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class LocalRanking extends StaticComponent {

  private readonly height = CONFIG.locals.height
  private readonly width = CONFIG.static.width
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxRecords: number = Number(process.env.LOCALS_AMOUNT)

  constructor() {
    super(IDS.locals, { displayOnRace: true, hideOnResult: true })
    const side: boolean = CONFIG.locals.side
    const pos = getStaticPosition('locals')
    this.positionX = pos.x
    this.positionY = pos.y
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.marginSmall), CONFIG.locals.entries, side, CONFIG.locals.topCount, this.maxRecords, CONFIG.locals.displayNoRecordEntry)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    TM.addListener('Controller.PlayerRecord', (): void => {
      if (this._isDisplayed) {
        this.display()
      }
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (this._isDisplayed && TM.localRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (this._isDisplayed && TM.localRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.LocalRecords', (): void => {
      if (this._isDisplayed) { this.display() }
    })
  }

  display(): void {
    this._isDisplayed = true
    // Here all manialinks have to be constructed separately because they are different for every player
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.locals.title, stringToObjectProperty(CONFIG.locals.icon, ICONS), true, { actionId: IDS.localCps })}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.marginSmall} 1">
          ${this.recordList.constructXml(login, TM.localRecords.map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
