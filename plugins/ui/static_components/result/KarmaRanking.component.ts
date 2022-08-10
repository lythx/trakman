import { getResultPosition, IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as TM } from '../../../../src/Trakman.js'

const MIN_AMOUNT = 5 // TODO: this in config file

export default class KarmaRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.karmaRanking.height
  private readonly entries: number
  private readonly posX: number
  private readonly posY: number
  private readonly side = CFG.karmaRanking.side
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.karmaRanking, 'result')
    const pos = getResultPosition('karmaRanking')
    this.posX = pos.x
    this.posY = pos.y
    this.entries = CFG.karmaRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.karmaRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    TM.addListener('Controller.KarmaVote', () => {
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
    const list = TM.maps.list.sort((a, b) => b.voteRatio - a.voteRatio).filter(a => a.voteCount > MIN_AMOUNT).slice(0, this.entries)
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.karmaRanking.title, CFG.karmaRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(list.map(a => Math.round(a.voteRatio).toString()), list.map(a => TM.utils.safeString(TM.utils.strip(a.name, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}