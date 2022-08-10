import { IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as TM } from '../../../../src/Trakman.js'
import { stats } from '../../../stats/Stats.js'

export default class PlaytimeRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.playtimeRanking.height
  private readonly entries: number
  private readonly posX = CFG.static.rightPosition - (CFG.static.width + CFG.marginBig)
  private readonly posY = CFG.static.topBorder
  private readonly list: List
  private readonly side = CFG.playtimeRanking.side
  private xml = ''

  constructor() {
    super(IDS.playtimeRanking, 'result')
    this.entries = CFG.playtimeRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.playtimeRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    stats.playtimes.onUpdate(() => {
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
    const list = stats.playtimes.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.playtimeRanking.title, CFG.playtimeRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(list.map(a => (a.playtime / (60 * 60 * 1000)).toFixed(0)), list.map(a => TM.utils.safeString(TM.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}