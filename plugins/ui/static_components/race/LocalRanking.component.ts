import { getStaticPosition,  RecordList, IDS, StaticHeader } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import config from './LocalRanking.config.js'

export default class LocalRanking extends StaticComponent {
  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private readonly recordList: RecordList

  constructor() {
    super(IDS.locals, 'race')
    const pos = getStaticPosition(this)
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader()
    this.recordList = new RecordList(this.id, config.width, config.height - (this.header.options.height + config.margin), 
    config.entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('Controller.PlayerRecord', (): void =>  this.display())
    tm.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      if (tm.records.local.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('Controller.PlayerLeave', (info: LeaveInfo): void => {
      if (tm.records.local.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('Controller.LocalRecords', (): void =>  this.display())
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
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: IDS.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, tm.records.local
            .map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login }))
            .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
