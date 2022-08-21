import { getStaticPosition, RecordList, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty } from '../UiUtils.js'
import { trakman as tm } from '../../../src/Trakman.js'
import { dedimania } from '../../dedimania/Dedimania.js'
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
    dedimania.onFetch((): void => {
      this.display()
    })
    dedimania.onRecord((): void => {
      this.display()
    })
    tm.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (dedimania.getRecord(info.login) !== undefined) { this.display() }
    })
    tm.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (dedimania.getRecord(info.login) !== undefined) { this.display() }
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
        ${staticHeader(CONFIG.dedis.title, stringToObjectProperty(CONFIG.dedis.icon, ICONS), false, { actionId: IDS.dediCps })}
        <frame posn="0 -${CONFIG.staticHeader.height + CONFIG.marginSmall} 1">
          ${this.recordList.constructXml(login, dedimania.records.map(a => ({ ...a, name: a.nickname })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
