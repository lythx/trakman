import { getStaticPosition, RecordList, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class DediRanking extends StaticComponent {

  private readonly height = CONFIG.dedis.height
  private readonly width = CONFIG.static.width
  private readonly positionX: number
  private readonly positionY: number
  private readonly recordList: RecordList
  private readonly maxDedis: number = Number(process.env.DEDIS_AMOUNT)

  constructor() {
    super(IDS.dedis, 'race')
    const side: boolean = CONFIG.dedis.side
    const pos = getStaticPosition('dedis')
    this.positionX = pos.x
    this.positionY = pos.y
    this.recordList = new RecordList(this.id, this.width, this.height - (CONFIG.staticHeader.height + CONFIG.marginSmall), CONFIG.dedis.entries, side, CONFIG.dedis.topCount, this.maxDedis, CONFIG.dedis.displayNoRecordEntry)
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
    if(this.isDisplayed === false) { return }
    // Here all manialinks have to be constructed separately because they are different for every player
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if(this.isDisplayed === false) { return }
    TM.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.dedis.title, stringToObjectProperty(CONFIG.dedis.icon, ICONS), false, { actionId: IDS.dediCps })}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.marginSmall} 1">
          ${this.recordList.constructXml(login, TM.dediRecords.map(a => ({ ...a, name: a.nickname })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
