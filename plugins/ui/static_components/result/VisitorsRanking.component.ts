import { componentIds, List, StaticHeader, StaticComponent } from '../../UiUtils.js'
import { stats } from '../../../stats/Stats.js'
import config from './VisitorsRanking.config.js'

export default class VisitorsRanking extends StaticComponent {

  private readonly posX: number
  private readonly posY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private readonly list: List
  private xml = ''

  constructor() {
    super(componentIds.visitorsRanking, 'result')
    const pos = this.getRelativePosition()
    this.posX = pos.x
    this.posY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, config.height - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    stats.visits.onUpdate(() => this.display())
    stats.visits.onNicknameChange(() => this.display())
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
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => a.visits.toString()), list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}