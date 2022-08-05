import { IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { TRAKMAN as TM } from '../../../../src/Trakman.js'
import { TopPlayerRecords } from '../../../TopPlayerRecords.js'

export default class MostRecordsRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.mostRecordsRanking.height
  private readonly entries: number
  private readonly posX = CFG.static.leftPosition + (CFG.static.width + CFG.marginBig) * 2
  private readonly posY = CFG.static.topBorder
  private readonly side = CFG.mostRecordsRanking.side
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.mostRecordsRanking, 'result')
    this.entries = CFG.mostRecordsRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.mostRecordsRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    this.constructXml()
    TM.addListener('Controller.EndMap', () => {
      this.constructXml()
    })
    TopPlayerRecords.onUpdate(() => {
      if (this.isDisplayed === true) {
        this.constructXml()
        this.display()
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    this.constructXml()
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    TM.sendManialink(this.xml, login)
  }

  constructXml() {
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.mostRecordsRanking.title, CFG.mostRecordsRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(TopPlayerRecords.list.map(a => a.amount.toString()), TopPlayerRecords.list.map(a => TM.safeString(TM.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}