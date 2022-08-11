import { getStaticPosition, centeredText, RecordList, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { trakman as tm } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class LiveRanking extends StaticComponent {

  private readonly height = CONFIG.live.height
  private readonly width = CONFIG.static.width
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxRecords: number = 250

  constructor() {
    super(IDS.live, 'race')
    const side: boolean = CONFIG.live.side
    const pos = getStaticPosition('live')
    this.positionX = pos.x
    this.positionY = pos.y
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.marginSmall), CONFIG.live.entries, side, CONFIG.live.topCount, this.maxRecords, CONFIG.live.displayNoRecordEntry)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('Controller.LiveRecord', (): void => {
      this.display()
    })
    tm.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (tm.records.live.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (tm.records.live.some(a => a.login === info.login)) { this.display() }
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
        ${staticHeader(CONFIG.live.title, stringToObjectProperty(CONFIG.live.icon, ICONS), true, { actionId: IDS.liveCps })}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.marginSmall} 1">
          ${this.recordList.constructXml(login, tm.records.live.map(a => ({ name: a.nickname, time: a.time, checkpoints: a.checkpoints, login: a.login })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }
}
