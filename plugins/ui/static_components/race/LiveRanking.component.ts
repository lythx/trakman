import { RecordList, IDS, StaticHeader } from '../../UiUtils.js'

import StaticComponent from '../../StaticComponent.js'
import config from './LiveRanking.config.js'

export default class LiveRanking extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private readonly recordList: RecordList

  constructor() {
    super(IDS.live, 'race')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.recordList = new RecordList(this.id, config.width, config.height - (this.header.options.height + config.margin),
      config.entries, this.side, config.topCount, config.maxRecordsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('LiveRecord', (): void => {
      this.display()
    })
    tm.addListener('PlayerJoin', (info: JoinInfo): void => {
      if (tm.records.live.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerLeave', (info: LeaveInfo): void => {
      if (tm.records.live.some(a => a.login === info.login)) { this.display() }
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
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: IDS.liveCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, tm.records.live.map(a => ({ name: a.nickname, time: a.time, checkpoints: a.checkpoints, login: a.login })))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }
}
