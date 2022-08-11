import { getResultPosition, IDS, RESULTCONFIG as CFG, RecordList, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as tm } from '../../../../src/Trakman.js'

export default class NextMapRecords extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.nextMapRecords.height
  private readonly entries: number
  private readonly posX: number
  private readonly posY: number
  private readonly side = CFG.nextMapRecords.side
  private records: TMRecord[] = []
  private readonly list: RecordList

  constructor() {
    super(IDS.nextMapRecords, 'result')
    const pos = getResultPosition('nextMapRecords')
    this.posX = pos.x
    this.posY = pos.y
    this.entries = CFG.nextMapRecords.entries
    this.list = new RecordList(this.id, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), this.entries, this.side, 5, 5, false,
      { getColoursFromPb: true, resultMode: true })
    this.list.onClick((info: ManialinkClickInfo): void => {
      this.displayToPlayer(info.login)
    })
    tm.addListener('Controller.EndMap', async () => {
      const mapId = tm.jukebox.queue[0].id
      this.records = await tm.records.fetchByMap(mapId)
      this.display()
    })
    tm.addListener('Controller.BeginMap', () => {
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
        ${resultStaticHeader(CFG.nextMapRecords.title, CFG.nextMapRecords.icon, this.side)}
        <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(login, this.records.map(a => ({ name: a.nickname, time: a.time, date: a.date, checkpoints: a.checkpoints, login: a.login })))}
        </frame>
      </frame>
    </manialink>`, login)
  }

}