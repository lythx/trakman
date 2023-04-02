/**
 * @author lythx
 * @since 0.4
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import config from './LocalRankingResult.config.js'

export default class LocalRankingResult extends StaticComponent {

  private readonly header: StaticHeader
  private readonly recordList: RecordList

  constructor() {
    super(componentIds.localsResult, 'result')
    this.header = new StaticHeader('result')
    this.recordList = new RecordList('result', this.id, config.width, config.height - (this.header.options.height + config.margin),
      config.entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('PlayerJoin', (info: tm.JoinInfo): void => {
      if (tm.records.local.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerLeave', (info: tm.LeaveInfo): void => {
      if (tm.records.local.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (tm.records.local.some(a => info.some(b => b.login === a.login))) { this.display() }
    })
    tm.addListener('LocalRecordsRemoved', (): void => this.display())
  }

  display(): void {
    if (!this.isDisplayed) { return }
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.localCps })}
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
