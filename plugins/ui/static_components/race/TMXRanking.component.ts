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
    tm.addListener('LiveRecord', (info): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('PlayerJoin', (info: tm.JoinInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('PlayerLeave', (info: tm.LeaveInfo): void => {
      this.displayToPlayer(info.login)
    })
    tmx.onMapChange((): void => this.display())
    tmx.onQueueChange((): void => this.display())
  }

  onPositionChange(): void {
    this.createRecordList()
    this.display()
  }

  createRecordList(): void {
    this.recordList?.destroy()
    this.recordList = new RecordList('race', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin), config.entries,
      this.side, config.topCount, config.entries, config.displayNoRecordEntry, { getColoursFromPb: true })
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
  }

  display(): void {
    if (!this.isDisplayed) { return }
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    let replays: { name: string, time: number, date: Date, login?: string }[] = []
    const tmxInfo: tm.TMXMap | null = tmx.current
    if (tmxInfo !== null) {
      replays = tmxInfo.validReplays.map(a => ({ name: a.name, time: a.time, date: a.recordDate, url: a.url }))
    }
    tm.sendManialink(`<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.TMXDetailsWindow })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(login, replays)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

}
