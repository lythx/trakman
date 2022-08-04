import { getResultPosition, IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { TRAKMAN as TM } from '../../../../src/Trakman.js'

export default class KarmaRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.karmaRanking.height
  private readonly entries: number
  private readonly posX: number
  private readonly posY: number
  private readonly side = CFG.karmaRanking.side
  private ranking: { name: string, karma: number }[] = []
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.karmaRanking, 'result')
    const pos = getResultPosition('karmaRanking')
    this.posX = pos.x
    this.posY = pos.y
    this.entries = CFG.karmaRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.karmaRanking.columnProportions as any, { background: CFG.static.bgColor })
    const topMaps = TM.voteRatios.sort((a, b) => b.ratio - a.ratio).slice(0, this.entries)
    this.ranking = topMaps.map(a => ({ name: TM.maps.find(b => b.id === a.mapId)?.name ?? '', karma: a.ratio }))
    this.constructXml()
    TM.addListener('Controller.EndMap', () => {
      const topMaps = TM.voteRatios.sort((a, b) => b.ratio - a.ratio).slice(0, this.entries)
      this.ranking = topMaps.map(a => ({ name: TM.maps.find(b => b.id === a.mapId)?.name ?? '', karma: a.ratio }))
      this.constructXml()
    }, true)
    TM.addListener('Controller.KarmaVote', () => {
      if (this.isDisplayed === true) {
        this.constructXml()
        this.display()
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
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
      ${resultStaticHeader(CFG.karmaRanking.title, CFG.karmaRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(this.ranking.map(a => a.karma.toString()), this.ranking.map(a => TM.safeString(TM.strip(a.name, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}