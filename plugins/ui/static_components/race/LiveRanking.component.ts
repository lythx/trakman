/**
 * @author lythx
 * @since 0.1
 */

import { RecordList, componentIds, StaticHeader, StaticComponent, RLRecord } from '../../UI.js'
import config from './LiveRanking.config.js'

export default class LiveRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList
  private title!: string

  constructor() {
    super(componentIds.live)
    this.header = new StaticHeader('race')
    this.getRecordList()
    this.renderOnEvent('LiveRecord', () => this.display())
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (tm.records.live.some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (tm.records.live.some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (tm.records.live.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
    this.renderOnEvent('PlayerCheckpoint', () => {
      if (tm.getGameMode() === 'Laps') {
        return this.display()
      }
    })
    this.onPanelHide((player) => {
      this.sendMultipleManialinks(this.displayToPlayer(player.login))
    })
  }

  getEntries(): number {
    if (tm.getGameMode() === 'Laps') {
      return config.lapsEntries
    } if (tm.getGameMode() === 'Stunts') {
      return config.stuntsEntries
    }
    return config.entries
  }

  getHeight(): number {
    return config.entryHeight * this.getEntries() + StaticHeader.raceHeight + config.margin
  }

  getTopCount(): number {
    if (tm.getGameMode() === 'Laps') {
      return config.lapsTopCount
    } if (tm.getGameMode() === 'Stunts') {
      return config.stuntsTopCount
    }
    return config.topCount
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
    if (config.hidePanel && this.hasPanelsHidden(login)) {
      return this.hideToPlayer(login)
    }
    let content: string
    this.title = config.title
    if (tm.getGameMode() === 'Laps') {
      this.title = config.lapsTitle
      const list = ((tm.players.list.map((a) => {
        const record = tm.records.getLive(a.login)
        let text: string | undefined
        const cpCount = a.currentCheckpoints.length
        if (record !== undefined) {
          text = tm.utils.getTimeString(record.time)
        } else {
          if (cpCount === 0) {
            return null // Not displaying players with 0 cps and no fin
          }
          const mapCps = tm.maps.current.checkpointsAmount - 1
          text = `${cpCount}/${mapCps}`
        }
        return {
          cpCount, time: 0, login: a.login, name: a.nickname,
          checkpoints: record === undefined ? a.currentCheckpoints.map(a => a.time) : record.checkpoints,
          text, finishTime: record?.time
        }
      }).filter(a => a !== null) as any)
        .sort((a: any, b: any) => b.cpCount - a.cpCount) // Sort secondary by cp amount
        .sort((a: any, b: any) => a.finishTime - b.finishTime) as RLRecord[]) // Sort primary by finish time
      content = this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, list)
    } else {
      content = this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, tm.records.live
        .map(a => ({ name: a.nickname, time: a.time, checkpoints: a.checkpoints, login: a.login })))
    }
    return {
      xml: `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(this.title, config.icon, this.side, { actionId: componentIds.liveCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${content}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

  private getRecordList(): void {
    const entries = this.getEntries()
    const height = this.getHeight()
    let dontParseTime = false
    let noRecordEntryText: string | undefined
    if (tm.getGameMode() === 'Laps') {
      dontParseTime = true
      noRecordEntryText = config.lapsNoRecordEntry
    } else if (tm.getGameMode() === 'Stunts') {
      noRecordEntryText = config.stuntsNoRecordEntry
    }
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, this.getTopCount(), tm.records.maxLocalsAmount, config.displayNoRecordEntry,
      { dontParseTime, noRecordEntryText })
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

}
