/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, RecordList, StaticHeader, StaticComponent } from '../../UI.js'
import config from './NextMapRecords.config.js'

export default class NextMapRecords extends StaticComponent {

  private readonly header: StaticHeader
  private records: tm.Record[] = []
  private readonly list: RecordList

  constructor() {
    super(componentIds.nextMapRecords)
    this.header = new StaticHeader('result')
    this.list = new RecordList('result', this.id, config.width, config.height - (this.header.options.height + config.margin),
      config.entries, this.side, 5, 5, false, { getColoursFromPb: true })
    this.list.onClick((info: tm.ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('EndMap', async (info): Promise<void> => {
      if (info.isRestart) {
        this.records = tm.records.local
        this.display()
      } else {
        const mapId: string = tm.jukebox.queue[0].id
        this.records = tm.records.getFromQueue(mapId)
        this.display()
      }
    })
    tm.addListener('RecordsPrefetch', async (): Promise<void> => {
      const mapId: string = tm.jukebox.queue[0].id
      this.records = tm.records.getFromQueue(mapId)
      this.display()
    })
    tm.addListener('PlayerDataUpdated', (info): void => {
      if (tm.records.local.some(a => info.some(b => b.login === a.login))) { this.display() }
    })
    tm.addListener('BeginMap', (): void => {
      this.records.length = 0
    })
  }

  getHeight(): number {
    return config.height
  }

  display(): void {
    if (!this.isDisplayed) { return }
    for (const e of tm.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.positionX} ${this.positionY} 2">
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(login, this.records.map(a => ({
      name: a.nickname, time: a.time,
      date: a.date, checkpoints: a.checkpoints, login: a.login
    })))}
        </frame>
      </frame>
    </manialink>`, login)
  }

}
