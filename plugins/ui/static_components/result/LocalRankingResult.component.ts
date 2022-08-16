import { RecordList, RESULTCONFIG as CONFIG, IDS, resultStaticHeader, getIcon, getResultPosition } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import 'dotenv/config'

export default class LocalRankingResult extends StaticComponent {

  private readonly height = CONFIG.locals.height
  private readonly width = CONFIG.static.width
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxRecords: number = Number(process.env.LOCALS_AMOUNT)

  constructor() {
    super(IDS.localsResult, 'result')
    const side: boolean = CONFIG.locals.side
    const pos = getResultPosition('locals')
    this.positionX = pos.x
    this.positionY = pos.y
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.marginSmall), CONFIG.locals.entries, side, CONFIG.locals.topCount, this.maxRecords, CONFIG.locals.displayNoRecordEntry, { resultMode: true })
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (tm.records.local.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (tm.records.local.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('Controller.LocalRecords', (): void => {
      this.display()
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    // Here all manialinks have to be constructed separately because they are different for every player
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${resultStaticHeader(CONFIG.locals.title, getIcon(CONFIG.locals.icon), false, { actionId: IDS.localCps })}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.marginSmall} 1">
          ${this.recordList.constructXml(login, tm.records.local.map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login })).slice(0, this.maxRecords))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
