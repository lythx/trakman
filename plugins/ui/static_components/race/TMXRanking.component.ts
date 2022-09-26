import { RecordList, IDS, StaticHeader } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import { tmx } from '../../../tmx/Tmx.js'
import config from './TMXRanking.config.js'

export default class TMXRanking extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly recordList: RecordList
  private readonly header: StaticHeader

  constructor() {
    super(IDS.tmx, 'race')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.recordList = new RecordList(this.id, config.width, config.height - (this.header.options.height + config.margin), config.entries,
      this.side, config.topCount, config.entries, config.displayNoRecordEntry, { getColoursFromPb: true })
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('LiveRecord', (info: FinishInfo): void => {
      if (tmx.current?.replays?.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerJoin', (info: JoinInfo): void => {
      if (tmx.current?.replays?.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerLeave', (info: LeaveInfo): void => {
      if (tmx.current?.replays?.some(a => a.login === info.login)) { this.display() }
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
    let replays: { name: string, time: number, date: Date, login?: string }[] = []
    const tmxInfo: TM.TMXMap | null = tmx.current
    if (tmxInfo !== null) {
      replays = tmxInfo.replays.map(a => ({ name: a.name, time: a.time, date: a.recordDate, login: a.login, url: a.url }))
    }
    tm.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, replays)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
