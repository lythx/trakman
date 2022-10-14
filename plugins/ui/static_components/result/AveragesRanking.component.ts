import { List, IDS, StaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { stats } from '../../../stats/Stats.js'
import config from './AveragesRanking.config.js'

export default class AveragesRanking extends StaticComponent {

  private readonly posX: number
  private readonly posY: number
  private readonly side: boolean
  private readonly list: List
  private readonly header: StaticHeader
  private xml = ''

  constructor() {
    super(IDS.averagesRanking, 'result')
    const pos = this.getRelativePosition()
    this.posX = pos.x
    this.posY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width,
      config.height - (this.header.options.height + config.margin), config.columnProportions,
      { background: config.background, headerBg: this.header.options.textBackground })
    stats.averages.onUpdate(() => this.display())
    stats.averages.onNicknameChange(() => this.display())
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
    const list = stats.averages.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => a.average.toString()), list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}