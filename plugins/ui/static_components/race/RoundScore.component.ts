/**
 * @author lythx
 * @since 1.2
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'

import config from './RoundScore.config.js'

export default class RoundScore extends StaticComponent {

  private readonly header: StaticHeader
  private readonly recordList: RecordList
  private roundRecords: tm.FinishInfo[] = []

  constructor() {
    super(componentIds.roundScore, 'race', ['Teams'])
    this.header = new StaticHeader('race')
    this.recordList = new RecordList('race', this.id, config.width, config.height - (this.header.options.height + config.margin),
      config.entries, this.side, config.topCount, 250, config.displayNoRecordEntry) // TODO
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('PlayerFinish', (info): void => {
      this.roundRecords.push(info)
      this.display()
    })
    tm.addListener('TrackMania.BeginRound', () => {
      this.roundRecords.length = 0
      this.display()
    })
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (tm.records.local.some(a => info.some(b => b.login === a.login))) { this.display() }
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
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, this.roundRecords
      .map(a => ({
        name: a.nickname, time: a.time, checkpoints: a.checkpoints,
        login: a.login, points: a.roundPoints, color: a.team
      }))
      .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
