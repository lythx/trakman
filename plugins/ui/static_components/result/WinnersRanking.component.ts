import { IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as TM } from '../../../../src/Trakman.js'
import { topWins } from '../../../stats/TopWins.js'

export default class WinnersRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.winnersRanking.height
  private readonly entries: number
  private readonly posX = CFG.static.leftPosition + CFG.static.width + CFG.marginBig
  private readonly posY = CFG.static.topBorder
  private readonly side = CFG.winnersRanking.side
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.winnersRanking, 'result')
    this.entries = CFG.winnersRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.winnersRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    topWins.onUpdate(() =>this.display())
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
    const list = topWins.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
        ${resultStaticHeader(CFG.winnersRanking.title, CFG.winnersRanking.icon, this.side)}
        <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
          ${this.list.constructXml(list.map(a => a.wins.toString()), list.map(a => TM.utils.safeString(TM.utils.strip(a.nickname, false))))}
        </frame>
      </frame>
    </manialink>`
  }

}