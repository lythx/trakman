/**
 * @author lythx
 * @since 0.1
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import { dedimania } from '../../../dedimania/Dedimania.js'

import config from './DediRanking.config.js'

export default class DediRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList
  private readonly maxDedis: number = dedimania.recordCountLimit

  constructor() {
    super(componentIds.dedis)
    this.header = new StaticHeader('race')
    this.getRecordList()
    dedimania.onFetch(() => this.sendMultipleManialinks(this.display()))
    dedimania.onRecord(() => this.sendMultipleManialinks(this.display()))
    dedimania.onNicknameUpdate(() => this.sendMultipleManialinks(this.display()))
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (dedimania.getRecord(info.login) !== undefined) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (dedimania.getRecord(info.login) !== undefined) { return this.display() }
    })
    this.onPanelHide((player) => {
      this.sendMultipleManialinks(this.displayToPlayer(player.login))
    })
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
    return {
      xml: `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.dediCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, dedimania.records.map(a => ({ ...a, name: a.nickname })))}
        </frame>
      </frame>
    </manialink>`,
      login
    }
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

  getHeight(): number {
    return config.entryHeight * this.getEntries() + StaticHeader.raceHeight + config.margin
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

  protected onPositionChange(): void {
    this.getRecordList()
    this.sendMultipleManialinks(this.display())
  }

  private getRecordList(): void {
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin),
      this.getEntries(), this.side, this.getTopCount(), this.maxDedis, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
  }

}
