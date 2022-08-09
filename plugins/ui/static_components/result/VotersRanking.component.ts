import { getResultPosition, IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as TM } from '../../../../src/Trakman.js'
import { stats } from '../../../stats/Stats.js'

export default class VotersRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.votersRanking.height
  private readonly entries: number
  private readonly posX: number
  private readonly posY: number
  private readonly side = CFG.votersRanking.side
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.votersRanking, 'result')
    const pos = getResultPosition('votersRanking')
    this.posX = pos.x
    this.posY = pos.y
    this.entries = CFG.votersRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.votersRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    this.constructXml()
    TM.addListener('Controller.EndMap', () => {
      this.constructXml()
    })
    stats.votes.onUpdate(() => {
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
    const votes = stats.votes.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.votersRanking.title, CFG.votersRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(votes.map(a => a.count.toString()), votes.map(a => TM.utils.safeString(TM.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}