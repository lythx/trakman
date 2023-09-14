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
    super(componentIds.localsResult)
    this.header = new StaticHeader('result')
    this.recordList = new RecordList('result', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo) => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) { tm.sendManialink(obj.xml, obj.login) }
    })
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (tm.records.local.some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (tm.records.local.some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (tm.records.local.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
    this.renderOnEvent('LocalRecordsRemoved', () => { return this.display() })
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.reduxModeEnabled) { return this.displayToPlayer('')?.xml }
    const arr = []
    for (const player of tm.players.list) {
      arr.push(this.displayToPlayer(player.login))
    }
    return arr
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return {
      xml: `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, tm.records.local
        .map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login }))
        .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

}
