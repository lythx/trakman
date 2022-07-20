import { calculateStaticPositionY, centeredText, RecordList, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class LiveRanking extends StaticComponent {

  private readonly height: number
  private readonly width: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxRecords: number = 250

  constructor() {
    super(IDS.live, { displayOnRace: true, hideOnResult: true })
    this.height = CONFIG.live.height
    this.width = CONFIG.static.width
    const side: boolean = CONFIG.live.side
    this.positionX = side ? CONFIG.static.rightPosition : CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('live')
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.static.marginSmall), CONFIG.live.entries, side, CONFIG.live.topCount, this.maxRecords, CONFIG.live.displayNoRecordEntry)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    TM.addListener('Controller.LiveRecord', (): void => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (TM.liveRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (TM.liveRecords.some(a => a.login === info.login)) { this.display() }
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
        ${staticHeader(CONFIG.live.title, stringToObjectProperty(CONFIG.live.icon, ICONS), true)}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1">
          ${this.recordList.constructXml(login, TM.liveRecords.map(a => ({ name: a.nickname, time: a.time, checkpoints: a.checkpoints, login: a.login })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }
}
