import { TRAKMAN as TM } from '../../../../src/Trakman.js'
import { RESULTCONFIG as CFG, List, IDS, resultStaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'

export default class TopRanks extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.playtimeRanking.height
  private readonly entries: number
  private readonly posX = CFG.static.rightPosition - (CFG.static.width + CFG.marginBig)
  private readonly posY = CFG.static.topBorder
  private readonly list: List
  private readonly side = CFG.playtimeRanking.side
  private xml = ''
  private ranking: { nickname: string, rank: number }[] = []

  constructor() {
    super(IDS.playtimeRanking, 'result')
    this.entries = CFG.playtimeRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.playtimeRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    this.constructXml()
    TM.addListener('Controller.EndMap', async () => {
      TM.playerRanks
      //  this.ranking.push(...res.map(a => ({ nickname: a.nickname, playtime: Math.round(a.time_played / (60 * 60 * 1000)) })))
      this.display()
    })
    TM.addListener('Controller.BeginMap', () => {
      this.ranking.length = 0
      this.constructXml()
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
      ${resultStaticHeader(CFG.playtimeRanking.title, CFG.playtimeRanking.icon, this.side)}
      <frame posn="0 ${-CFG.staticHeader.height - CFG.marginSmall} 2">
        ${this.list.constructXml(this.ranking.map(a => a.rank.toString()), this.ranking.map(a => TM.safeString(TM.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}