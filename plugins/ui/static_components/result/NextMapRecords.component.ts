import { IDS, RecordList, StaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import config from './NextMapRecords.config.js'

export default class NextMapRecords extends StaticComponent {

  private readonly posX: number
  private readonly posY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private records: TMRecord[] = []
  private readonly list: RecordList

  constructor() {
    super(IDS.nextMapRecords, 'result')
    const pos = this.getRelativePosition()
    this.posX = pos.x
    this.posY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('result')
    this.list = new RecordList(this.id, config.width, config.height - (this.header.options.height + config.margin),
      config.entries, this.side, 5, 5, false, { getColoursFromPb: true, resultMode: true })
    this.list.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('EndMap', async (info) => {
      if (info.isRestart === true) {
        this.records = tm.records.local
        this.display()
      } else {
        const mapId = tm.jukebox.queue[0].id
        this.records = await tm.records.fetchByMap(mapId)
        this.display()
      }
    })
    tm.addListener('JukeboxChanged', async () => {
      const mapId = tm.jukebox.queue[0].id
      this.records = await tm.records.fetchByMap(mapId) // TODO fix after prefetch in source
      this.display()
    })
    tm.addListener('BeginMap', () => {
      this.records.length = 0
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const e of tm.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
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