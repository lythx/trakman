import { getResultPosition, IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { TRAKMAN as TM } from '../../../../src/Trakman.js'
import { PlayerVoteCount } from '../../../PlayerVoteCount.js'

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
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.karmaRanking.columnProportions as any, { background: CFG.static.bgColor })
    this.constructXml()
    TM.addListener('Controller.EndMap', () => {
      this.constructXml()
    })
    PlayerVoteCount.onTopVoteCountUpdated(() => {
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
      ${resultStaticHeader(CFG.votersRanking.title, CFG.votersRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(PlayerVoteCount.topVoteCounts.map(a => a.count.toString()), PlayerVoteCount.topVoteCounts.map(a => a.login))}
      </frame>
      </frame>
    </manialink>`
  }

}