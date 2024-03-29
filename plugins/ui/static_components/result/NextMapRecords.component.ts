/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, RecordList, StaticHeader, StaticComponent } from '../../UI.js'
import config from './NextMapRecords.config.js'

export default class NextMapRecords extends StaticComponent {

  private readonly header: StaticHeader
  private records: tm.Record[] = []
  private readonly recordList: RecordList

  constructor() {
    super(componentIds.nextMapRecords)
    this.header = new StaticHeader('result')
    this.recordList = new RecordList('result', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.entries, this.side, 5, 5, false, { getColoursFromPb: true })
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
    this.renderOnEvent('EndMap', (info) => {
      if (info.isRestart) {
        this.records = tm.records.local
        return this.display()
      } else {
        const mapId: string = tm.jukebox.queue[0].id
        this.records = tm.records.getFromQueue(mapId)
          .sort((a, b) => a.time - b.time)
          .filter((a, i, arr) => arr.findIndex(b => b.login === a.login && a.map === b.map) === i)
        return this.display()
      }
    })
    this.renderOnEvent('RecordsPrefetch', () => {
      const mapId: string = tm.jukebox.queue[0].id
      this.records = tm.records.getFromQueue(mapId)
      return this.display()
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (tm.records.local.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
    tm.addListener('BeginMap', (): void => {
      this.records.length = 0
    })
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.reduxModeEnabled) { return this.displayToPlayer('')?.xml }
    const arr = []
    for (const e of tm.players.list) {
      arr.push(this.displayToPlayer(e.login))
    }
    return arr
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    const pb = this.records.find(a => a.login === login)?.time
    return {
      xml: `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.positionX} ${this.positionY} 2">
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, this.records.map(a => ({
        name: a.nickname, time: a.time,
        date: a.date, checkpoints: a.checkpoints, login: a.login
      })), pb)}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

}
