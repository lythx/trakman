/**
 * @author lythx
 * @since 0.1
 */

// TODO MAYBE RENAME TO RoundsPointsRanking to be the same as in core

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import config from './RoundPointsRanking.config.js'

export default class RoundPointsRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList

  constructor() {
    super(componentIds.roundPointsRanking, 'race', ['Rounds'])
    this.header = new StaticHeader('race')
    this.getRecordList()
    tm.addListener('PlayerJoin', (info: tm.JoinInfo): void => {
      if (tm.rounds.pointsRanking.filter(a => a.roundsPoints !== 0)
        .some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerLeave', (info: tm.LeaveInfo): void => {
      if (tm.rounds.pointsRanking.filter(a => a.roundsPoints !== 0)
        .some(a => a.login === info.login)) { this.display() }
    })
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (info.some(a => tm.rounds.pointsRanking // TODO CHECK IF WORK
        .filter(b => b.roundsPoints !== 0).some(b => b.login === a.login))) { this.display() }
    })
    tm.addListener('PlayerFinish', (info: tm.FinishInfo): void => this.display())
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
    if (tm.getGameMode() === 'Cup') {
      height = config.cupHeight
      entries = config.cupEntries
    }
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, config.topCount, tm.records.maxLocalsAmount, config.displayNoRecordEntry,
      { dontParseTime: true, columnProportions: config.columnProportions })
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
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, tm.rounds.pointsRanking
      .filter(a => a.roundsPoints !== 0)
      .map(a => ({
        name: a.nickname, time: a.cupPosition ?? a.roundsPoints, login: a.login,
        checkpoints: a.roundTimes.map(a => a === -1 ? undefined : a),
      }))
      .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
