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
    super(componentIds.lapRanking)
    this.header = new StaticHeader('race')
    this.getRecordList()
    this.renderOnEvent('LapRecord', () => this.display())
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (tm.records.getLap(info.login) !== undefined) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (tm.records.getLap(info.login) !== undefined) { return this.display() }
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (tm.records.lap.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
    this.renderOnEvent('LocalRecordsRemoved', () => this.display())
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

  private getRecordList() {
    let entries = config.entries
    let height = this.getHeight()
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
  }

  protected onPositionChange(): void {
    this.getRecordList()
    this.sendMultipleManialinks(this.display())
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return {
      xml: `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId:/*TODO MAKE WINDOW FOR THIS */ componentIds.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, tm.records.lap
        .map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login }))
        .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

}
