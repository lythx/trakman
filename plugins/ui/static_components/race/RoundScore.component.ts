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
    super(componentIds.roundScore)
    this.header = new StaticHeader('race')
    this.getRecordList()
    this.renderOnEvent('PlayerFinish', () => this.display())
    this.renderOnEvent('BeginRound', () => this.display())
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (tm.records.roundRecords.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
  }

  getEntries(): number {
    if (tm.getGameMode() === 'Teams') {
      return config.teamsEntries
    } if (tm.getGameMode() === 'Cup') {
      return config.cupEntries
    }
    return config.roundsEntries
  }

  getHeight(): number {
    return config.entryHeight * this.getEntries() + StaticHeader.raceHeight + config.margin
  }

  getTopCount(): number {
    if (tm.getGameMode() === 'Teams') {
      return config.teamsTopCount
    } if (tm.getGameMode() === 'Cup') {
      return config.cupTopCount
    }
    return config.roundsTopCount
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
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, tm.records.roundRecords
        .map(a => ({
          name: a.nickname, time: a.time, checkpoints: a.checkpoints,
          login: a.login, points: a.roundPoints,
          colour: a.team !== undefined ? config.markerBackgrounds[a.team] : undefined,
          markerImage: this.getCupImage(a)
        }))
        .slice(0, tm.records.maxLocalsAmount))}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

  protected onPositionChange(): void {
    this.getRecordList()
    this.sendMultipleManialinks(this.display())
  }

  private getRecordList(): void {
    const height = this.getHeight()
    const entries = this.getEntries()
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, this.getTopCount(), 250, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.login, obj.xml)
      }
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
