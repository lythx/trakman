/**
 * @author lythx
 * @since 0.4
 */

import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import { dedimania } from '../../../dedimania/Dedimania.js'
import config from './DediRankingResult.config.js'

export default class DediRankingResult extends StaticComponent {

  private readonly header: StaticHeader
  private readonly recordList: RecordList
  private readonly maxDedis: number = dedimania.recordCountLimit

  constructor() {
    super(componentIds.dedisResult)
    this.header = new StaticHeader('result')
    this.recordList = new RecordList('result', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.entries, this.side, config.topCount, this.maxDedis, config.displayNoRecordEntry)
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if(this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
    dedimania.onNicknameUpdate(() => this.sendMultipleManialinks(this.display()))
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      if (dedimania.getRecord(info.login) !== undefined) { return this.display() }
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      if (dedimania.getRecord(info.login) !== undefined) { return this.display() }
    })
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
  }

  display() {
    if (!this.isDisplayed) { return }
    if(this.reduxModeEnabled) { return this.displayToPlayer('')?.xml }
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
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.dediCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, dedimania.records.map(a => ({ ...a, name: a.nickname })))}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

}
