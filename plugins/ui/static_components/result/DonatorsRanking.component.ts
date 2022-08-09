import { IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as TM } from '../../../../src/Trakman.js'
import { stats } from '../../../stats/Stats.js'

export default class DonatorsRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.donatorsRanking.height
  private readonly entries: number
  private readonly posX = CFG.static.rightPosition - (CFG.static.width + CFG.marginBig) * 2
  private readonly posY = CFG.static.topBorder
  private readonly list: List
  private readonly side = CFG.donatorsRanking.side
  private xml = ''

  constructor() {
    super(IDS.donatorsRanking, 'result')
    this.entries = CFG.donatorsRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.donatorsRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    stats.donations.onUpdate(()=> {
      this.display()
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
    const list = stats.donations.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.donatorsRanking.title, CFG.donatorsRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(list.map(a => a.amount.toString()), list.map(a => TM.utils.safeString(TM.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}