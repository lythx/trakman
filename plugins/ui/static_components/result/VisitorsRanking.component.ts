import { getResultPosition, IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import { stats } from '../../../stats/Stats.js'

export default class VisitorsRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.visitorsRanking.height
  private readonly entries: number
  private readonly posX: number
  private readonly posY: number
  private readonly side = CFG.visitorsRanking.side
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.visitorsRanking, 'result')
    const pos = getResultPosition('visitorsRanking')
    this.posX = pos.x
    this.posY = pos.y
    this.entries = CFG.visitorsRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.visitorsRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    stats.visits.onUpdate(() => this.display())
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    this.constructXml()
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml, login)
  }

  constructXml() {
    const list = stats.visits.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.visitorsRanking.title, CFG.visitorsRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(list.map(a => a.visits.toString()), list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}