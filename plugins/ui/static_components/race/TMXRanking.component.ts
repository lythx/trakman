/**
 * @author lythx
 * @since 0.1
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'

import { tmx } from '../../../tmx/Tmx.js'
import config from './TMXRanking.config.js'

export default class TMXRanking extends StaticComponent {

  private recordList!: RecordList
  private readonly header: StaticHeader

  constructor() {
    super(componentIds.tmx)
    this.header = new StaticHeader('race')
    this.createRecordList()
    this.renderOnEvent('LiveRecord', (info) => this.displayToPlayer(info.login))
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => this.displayToPlayer(info.login))
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => this.displayToPlayer(info.login))
    tmx.onMapChange(() => this.sendMultipleManialinks(this.display()))
    tmx.onQueueChange(() => this.sendMultipleManialinks(this.display()))
    this.onPanelHide((player) => {
      this.sendMultipleManialinks(this.displayToPlayer(player.login))
    })
  }

  onPositionChange(): void {
    this.createRecordList()
    this.sendMultipleManialinks(this.display())
  }

  createRecordList(): void {
    this.recordList?.destroy()
    this.recordList = new RecordList('race', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin), config.entries,
      this.side, config.topCount, config.entries, config.displayNoRecordEntry, { getColoursFromPb: true })
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
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
    let replays: { name: string, time: number, date: Date, login?: string }[] = []
    const tmxInfo: tm.TMXMap | null = tmx.current
    const isStunts = tm.getGameMode() === 'Stunts'
    if (tmxInfo !== null) {
      replays = tmxInfo.validReplays.map(a => ({
        name: a.name,
        time: isStunts ? (a.score ?? 0) : a.time, date: a.recordDate, url: a.url
      }))
    }
    return {
      xml: `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.TMXDetailsWindow })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, replays)}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

}
