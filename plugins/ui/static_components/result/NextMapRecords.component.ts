/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, RecordList, StaticHeader, StaticComponent } from '../../UI.js'
import config from './NextMapRecords.config.js'

// TODO THERES A BUG WHICH CAUSES RECORDS TO BE DISPLAYED TWICE, HAPPENED AFTER CHANGING GAMEMODES
export default class NextMapRecords extends StaticComponent {

  private readonly header: StaticHeader
  private records: tm.Record[] = []
  private readonly list: RecordList

  constructor() {
    super(componentIds.nextMapRecords)
    this.header = new StaticHeader('result')
    this.list = new RecordList('result', this.id, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.entries, this.side, 5, 5, false, { getColoursFromPb: true })
    this.list.onClick((info: tm.ManialinkClickInfo): void => {
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
    return {
      xml: `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.positionX} ${this.positionY} 2">
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(this.reduxModeEnabled ? undefined : login, this.records.map(a => ({
        name: a.nickname, time: a.time,
        date: a.date, checkpoints: a.checkpoints, login: a.login
      })))}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

}
