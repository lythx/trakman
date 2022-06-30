import { calculateStaticPositionY, RecordList, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class DediRanking extends StaticComponent {

  private readonly height: number
  private readonly width: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxDedis: number = Number(process.env.DEDIS_AMOUNT)

  constructor() {
    super(IDS.DediRanking, 'race')
    this.height = CONFIG.dedis.height
    this.width = CONFIG.static.width
    const side: boolean = CONFIG.dedis.side
    this.positionX = side ? CONFIG.static.rightPosition : CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('dedis')
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.static.marginSmall), CONFIG.dedis.entries, side, CONFIG.dedis.topCount, this.maxDedis, CONFIG.dedis.displayNoRecordEntry)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    TM.addListener('Controller.DedimaniaRecords', (): void => {
      this.display()
    })
    TM.addListener('Controller.DedimaniaRecord', (): void => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (TM.dediRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (TM.dediRecords.some(a => a.login === info.login)) { this.display() }
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
        ${staticHeader(CONFIG.dedis.title, stringToObjectProperty(CONFIG.dedis.icon, ICONS), false)}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1">
          ${this.recordList.constructXml(login, TM.dediRecords.map(a => ({ ...a, name: a.nickName })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
