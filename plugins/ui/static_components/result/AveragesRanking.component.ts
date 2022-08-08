import { trakman as TM } from '../../../../src/Trakman.js'
import { RESULTCONFIG as CFG, List, IDS, resultStaticHeader, getResultPosition } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { TopPlayerRanks } from '../../../TopPlayerAverages.js'

export default class AveragesRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.averagesRanking.height
  private readonly entries = CFG.averagesRanking.entries
  private readonly posX: number
  private readonly posY: number
  private readonly list: List
  private readonly side = CFG.averagesRanking.side
  private xml = ''
  private ranking: { nickname: string, average: number }[] = []

  constructor() {
    super(IDS.averagesRanking, 'result')
    const pos = getResultPosition('averagesRanking')
    this.posX = pos.x
    this.posY = pos.y
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.playtimeRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    this.ranking = TopPlayerRanks.list
    TM.addListener('Controller.EndMap', async () => {
      this.ranking = TopPlayerRanks.list
      this.display()
    })
    TM.addListener('Controller.BeginMap', () => {
      this.ranking.length = 0
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
      ${resultStaticHeader(CFG.averagesRanking.title, CFG.averagesRanking.icon, this.side)}
      <frame posn="0 ${-CFG.staticHeader.height - CFG.marginSmall} 2">
        ${this.list.constructXml(this.ranking.map(a => a.average.toFixed(2)), this.ranking.map(a => TM.utils.safeString(TM.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}