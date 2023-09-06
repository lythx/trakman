/**
 * @author lythx
 * @since 0.1
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'

import config from './LocalRanking.config.js'

export default class LocalRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList

  constructor() {
    super(componentIds.locals)
    this.header = new StaticHeader('race')
    this.getRecordList()
    this.renderOnEvent('LocalRecord', () => this.display())
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (tm.records.local.some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (tm.records.local.some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (tm.records.local.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
    this.renderOnEvent('LocalRecordsRemoved', () => this.display())
  }

  getEntries(): number {
    if (tm.getGameMode() === 'Teams') {
      return config.teamsEntries
    } if (tm.getGameMode() === 'Rounds') {
      return config.roundsEntries
    } if (tm.getGameMode() === 'Cup') {
      return config.cupEntries
    } if (tm.getGameMode() === 'Laps') {
      return config.lapsEntries
    }
    return config.entries
  }

  getTopCount(): number {
    if (tm.getGameMode() === 'Teams') {
      return config.teamsTopCount
    } if (tm.getGameMode() === 'Rounds') {
      return config.roundsTopCount
    } if (tm.getGameMode() === 'Cup') {
      return config.cupTopCount
    } if (tm.getGameMode() === 'Laps') {
      return config.lapsTopCount
    }
    return config.topCount
  }

  getHeight(): number {
    return config.entryHeight * this.getEntries() + StaticHeader.raceHeight + config.margin
  }

  display() {
    if (!this.isDisplayed) { return }
    const arr = []
    for (const player of tm.players.list) {
      arr.push(this.displayToPlayer(player.login))
    }
    return arr
  }

  private getRecordList(): void {
    const height = this.getHeight()
    const entries = this.getEntries()
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, this.getTopCount(), tm.records.maxLocalsAmount, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
  }

  protected onPositionChange() {
    this.getRecordList()
    this.sendMultipleManialinks(this.display())
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return {
      xml: `<manialink id="${this.id}">
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
    }
  }

}
