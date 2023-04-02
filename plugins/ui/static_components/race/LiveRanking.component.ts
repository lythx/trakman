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
    super(componentIds.live, 'race', ['TimeAttack', 'Laps'])
    this.header = new StaticHeader('race')
    this.getRecordList()
    tm.addListener('LiveRecord', (): void => {
      this.display()
    })
    tm.addListener('PlayerJoin', (info: tm.JoinInfo): void => {
      if (tm.records.live.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerLeave', (info: tm.LeaveInfo): void => {
      if (tm.records.live.some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (tm.records.live.some(a => info.some(b => b.login === a.login))) { this.display() }
    })
    tm.addListener('PlayerCheckpoint', (): void => {
      if (tm.getGameMode() === 'Laps') {
        this.display()
      }
    })
  }

  display(): void {
    if (!this.isDisplayed) { return }
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
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
      content = this.recordList.constructXml(login, list)
    } else {
      content = this.recordList.constructXml(login, tm.records.live
        .map(a => ({ name: a.nickname, time: a.time, checkpoints: a.checkpoints, login: a.login })))
    }
    tm.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(this.title, config.icon, this.side, { actionId: componentIds.liveCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${content}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private getRecordList(): void {
    let height = config.height
    let entries = config.entries
    let dontParseTime = false
    let noRecordEntryText: string | undefined
    if (tm.getGameMode() === 'Laps') {
      height = config.lapsHeight
      entries = config.lapsEntries
      dontParseTime = true
      noRecordEntryText = config.lapsNoRecordEntry
    }
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry,
      { dontParseTime, noRecordEntryText })
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
  }

  protected onPositionChange(): void {
    this.getRecordList()
    this.display()
  }

}
