/**
 * @author lythx
 * @since 0.1
 */

import { RecordList, componentIds, StaticHeader, StaticComponent, RLImage } from '../../UI.js'
import config from './RoundsPointsRanking.config.js'

export default class RoundsPointsRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList

  constructor() {
    super(componentIds.roundsPointsRanking, 'race', ['Rounds', 'Cup'])
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
      if (info.some(a => tm.rounds.pointsRanking
        .filter(b => b.roundsPoints !== 0).some(b => b.login === a.login))) { this.display() }
    })
    tm.addListener('PlayerFinish', (): void => this.display())
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
      { dontParseTime: true, columnProportions: config.columnProportions, noRecordEntryText: config.noRecordEntryText })
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
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, tm.rounds.pointsRanking
      .filter(a => a.roundsPoints !== 0)
      .map(a => ({
        name: a.nickname, time: a.roundsPoints, login: a.login,
        checkpoints: a.roundTimes.map(a => a === -1 ? undefined : a), image: this.getCupImage(a)
      }))
      .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private getCupImage(player: tm.Player): RLImage | undefined {
    if (player.cupPosition === undefined && !player.isCupFinalist) { return undefined }
    let url: string
    if (player.isCupFinalist) {
      url = config.cupFinalistImage
    } else {
      url = config.cupPositionImages[player.cupPosition as number - 1] ?? config.otherCupPositionsImage
    }
    return {
      url,
      verticalPadding: config.cupImageVerticalPadding,
      horizontalPadding: config.cupImageHorizontalPadding
    }
  }

}
