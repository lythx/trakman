import { getStaticPosition, RecordList, IDS, StaticHeader,} from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import { dedimania } from '../../../dedimania/Dedimania.js'
import StaticComponent from '../../StaticComponent.js'
import config from './DediRanking.config.js'

export default class DediRanking extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private readonly recordList: RecordList
  private readonly maxDedis: number = dedimania.maxRecordCount

  constructor() {
    super(IDS.dedis, 'race')
    const pos = getStaticPosition(this)
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader()
    this.recordList = new RecordList(this.id, config.width, config.height - (this.header.options.height + config.margin),
    config.entries, this.side,config.topCount, this.maxDedis, config.displayNoRecordEntry)
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
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: IDS.dediCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, dedimania.records.map(a => ({ ...a, name: a.nickname })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}