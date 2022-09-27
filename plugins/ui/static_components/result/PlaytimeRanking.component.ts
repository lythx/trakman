import { IDS, List, StaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'

import { stats } from '../../../stats/Stats.js'
import config from './PlaytimeRanking.config.js'

export default class PlaytimeRanking extends StaticComponent {

  private readonly list: List
  private readonly header: StaticHeader
  private xml = ''

  constructor() {
    super(IDS.playtimeRanking, 'result')
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, config.height - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    stats.playtimes.onUpdate(() => this.display())
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
    const list = stats.playtimes.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${config.posY} 2">
      ${this.header.constructXml(config.title, config.icon, config.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => (a.playtime / (60 * 60 * 1000)).toFixed(0)),
      list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}