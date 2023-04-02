/**
 * @author lythx
 * @since 0.4
 */

import { List, componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import { stats } from '../../../stats/Stats.js'
import config from './AveragesRanking.config.js'

export default class AveragesRanking extends StaticComponent {

  private readonly list: List
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(componentIds.averagesRanking, 'result')
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width,
      config.height - (this.header.options.height + config.margin), config.columnProportions,
      { background: config.background, headerBg: this.header.options.textBackground })
    stats.averages.onUpdate((): void => this.display())
    stats.averages.onNicknameChange((): void => this.display())
  }

  display(): void {
    if (!this.isDisplayed) { return }
    this.constructXml()
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(this.xml, login)
  }

  constructXml(): void {
    const list = stats.averages.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.positionX} ${this.positionY} 2">
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => a.average.toFixed(2)), list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}
