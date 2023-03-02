/**
 * @author lythx
 * @since 0.1
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'

import config from './LapRanking.config.js'

export default class LapRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList

  constructor() {
    super(componentIds.lapRanking, 'race', ['Laps'])
    this.header = new StaticHeader('race')
    this.getRecordList()
    tm.addListener('LapRecord', (): void => this.display())
    tm.addListener('PlayerJoin', (info: tm.JoinInfo): void => {
      if (tm.records.getLap(info.login) !== undefined) { this.display() }
    })
    tm.addListener('PlayerLeave', (info: tm.LeaveInfo): void => {
      if (tm.records.getLap(info.login) !== undefined) { this.display() }
    })
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (tm.records.lap.some(a => info.some(b => b.login === a.login))) { this.display() }
    })
    tm.addListener('LocalRecordsRemoved', (): void => this.display())
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  private getRecordList(): void {
    let height = config.height
    let entries = config.entries
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
  }

  protected onPositionChange(): void {
    this.getRecordList()
    this.display()
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId:/*TODO MAKE WINDOW FOR THIS */ componentIds.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, tm.records.lap
      .map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login }))
      .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}