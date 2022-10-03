import { IDS, List, StaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { stats } from '../../../stats/Stats.js'
import config from './WinnersRanking.config.js'

export default class WinnersRanking extends StaticComponent {

  private readonly header: StaticHeader
  private readonly list: List
  private xml = ''

  constructor() {
    super(IDS.winnersRanking, 'result')
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, config.height - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    stats.wins.onUpdate(() => this.display())
    stats.wins.onNicknameChange(() => this.display())
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
    const list = stats.wins.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${config.posY} 2">
        ${this.header.constructXml(config.title, config.icon, config.side)}
        <frame posn="0 ${-this.header.options.height - config.margin} 2">
          ${this.list.constructXml(list.map(a => a.wins.toString()), list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
        </frame>
      </frame>
    </manialink>`
  }

}