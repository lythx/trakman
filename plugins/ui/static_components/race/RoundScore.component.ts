/**
 * @author lythx
 * @since 1.2
 */

import { RecordList, componentIds, StaticHeader, StaticComponent, RLImage } from '../../UI.js'

import config from './RoundScore.config.js'

export default class RoundScore extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList

  constructor() {
    super(componentIds.roundScore, 'race', ['Teams', 'Rounds', 'Cup'])
    this.header = new StaticHeader('race')
    this.getRecordList()
    tm.addListener('PlayerFinish', (): void => this.display())
    tm.addListener('BeginRound', () => this.display())
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (tm.records.roundRecords.some(a => info.some(b => b.login === a.login))) { this.display() }
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
          ${this.recordList.constructXml(login, tm.records.roundRecords
      .map(a => ({
        name: a.nickname, time: a.time, checkpoints: a.checkpoints,
        login: a.login, points: a.roundPoints, color: a.team,
        markerImage: this.getCupImage(a)
      }))
      .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  protected onPositionChange(): void {
    this.getRecordList()
    this.display()
  }

  private getRecordList(): void {
    let height = config.roundsHeight
    let entries = config.roundsEntries
    if (tm.getGameMode() === 'Teams') {
      height = config.teamsHeight
      entries = config.teamsEntries
    } else if (tm.getGameMode() === 'Cup') {
      height = config.cupHeight
      entries = config.cupEntries
    }
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, config.topCount, 250, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
  }

  private getCupImage(player: tm.FinishInfo): RLImage | undefined {
    if (player.isCupFinalist) {
      return { url: config.cupFinalistIcon }
    }
    if (player.cupPosition === undefined) { return undefined }
    return { url: config.cupPositionImages[player.cupPosition - 1] ?? config.otherCupPositionsImage }
  }

}
