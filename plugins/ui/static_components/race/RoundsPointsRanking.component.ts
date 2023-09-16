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
    super(componentIds.roundsPointsRanking)
    this.header = new StaticHeader('race')
    this.getRecordList()
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (tm.rounds.pointsRanking.filter(a => a.roundsPoints !== 0)
        .some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (tm.rounds.pointsRanking.filter(a => a.roundsPoints !== 0)
        .some(a => a.login === info.login)) { return this.display() }
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (info.some(a => tm.rounds.pointsRanking
        .filter(b => b.roundsPoints !== 0).some(b => b.login === a.login))) { return this.display() }
    })
    this.renderOnEvent('PlayerFinish', () => this.display())
  }

  getEntries(): number {
    if (tm.getGameMode() === 'Cup') {
      return config.cupEntries
    }
    return config.entries
  }

  getHeight(): number {
    return config.entryHeight * this.getEntries() + StaticHeader.raceHeight + config.margin
  }

  getTopCount(): number {
    if (tm.getGameMode() === 'Cup') {
      return config.cupTopCount
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

  private getRecordList(): void {
    let height = this.getHeight()
    let entries = this.getEntries()
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, this.getTopCount(), tm.records.maxLocalsAmount, config.displayNoRecordEntry,
      { dontParseTime: true, columnProportions: config.columnProportions, noRecordEntryText: config.noRecordEntryText })
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        return tm.sendManialink(obj.xml, obj.login)
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
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, tm.rounds.pointsRanking
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
    }
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
