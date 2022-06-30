import { calculateStaticPositionY, RecordList, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class TMXRanking extends StaticComponent {

  private readonly height: number
  private readonly width: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxRecords: number = 20

  constructor() {
    super(IDS.tmx, 'race')
    this.height = CONFIG.tmx.height
    this.width = CONFIG.static.width
    const side: boolean = CONFIG.tmx.side
    this.positionX = side ? CONFIG.static.rightPosition : CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('tmx')
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.static.marginSmall), CONFIG.tmx.entries, side, CONFIG.tmx.topCount, this.maxRecords, CONFIG.tmx.displayNoRecordEntry, true)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    TM.addListener('Controller.LiveRecord', (info: RecordInfo): void => {
      if (TM.TMXCurrent?.replays?.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (TM.TMXCurrent?.replays?.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (TM.TMXCurrent?.replays?.some(a => a.login === info.login)) { this.display() }
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
    let replays: { name: string, time: number, date: Date, login?: string }[] = []
    const tmxInfo: TMXTrackInfo | null = TM.TMXCurrent
    if (tmxInfo !== null) {
      replays = tmxInfo.replays.map(a => ({ name: a.name, time: a.time, date: a.recordDate, login: a.login, url: a.url }))
    }
    TM.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.tmx.title, stringToObjectProperty(CONFIG.tmx.icon, ICONS), true)}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1">
          ${this.recordList.constructXml(login, replays)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
