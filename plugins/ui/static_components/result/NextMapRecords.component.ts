import { getResultPosition, IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { TRAKMAN as TM } from '../../../../src/Trakman.js'

export default class NextMapRecords extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.nextMapRecords.height
  private readonly entries: number
  private readonly posX: number
  private readonly posY: number
  private readonly side = CFG.nextMapRecords.side
  private records: { nickname: string, time: number }[] = []
  private readonly list: List

  constructor() {
    super(IDS.nextMapRecords, { hideOnRace: true })
    const pos = getResultPosition('nextMapRecords')
    this.posX = pos.x
    this.posY = pos.y
    this.entries = CFG.nextMapRecords.entries
    this.list = new List(this.entries, this.height, this.width, CFG.listColumns as any, { background: CFG.static.bgColor })
    TM.addListener('Controller.EndMap', async () => {
      const mapId = TM.mapQueue[0].id
      const records = await TM.fetchRecords(mapId)
      this.records = records.slice(0, this.entries)
      console.log(this.records)
      this.display()
    })
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(`<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
        ${resultStaticHeader(CFG.nextMapRecords.title, CFG.nextMapRecords.icon, this.side)}
        <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
          ${this.list.constructXml(this.records.map(a => TM.Utils.getTimeString(a.time)), this.records.map(a => TM.safeString(TM.strip(a.nickname, false))))}
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
        ${resultStaticHeader(CFG.nextMapRecords.title, CFG.nextMapRecords.icon, this.side)}
        <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
          ${this.list.constructXml(this.records.map(a => TM.Utils.getTimeString(a.time)), this.records.map(a => TM.safeString(TM.strip(a.nickname, false))))}
        </frame>
      </frame>
    </manialink>`, login)
  }

}