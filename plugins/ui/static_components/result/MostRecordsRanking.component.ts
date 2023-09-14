/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, List, StaticHeader, StaticComponent } from '../../UI.js'
import { stats } from '../../../stats/Stats.js'
import config from './MostRecordsRanking.config.js'

export default class MostRecordsRanking extends StaticComponent {

  private readonly list: List
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(componentIds.mostRecordsRanking)
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    this.constructXml()
    tm.addListener('EndMap', (): void => {
      this.constructXml()
    })
    stats.records.onUpdate(() => this.sendMultipleManialinks(this.display()))
    stats.records.onNicknameChange(() => this.sendMultipleManialinks(this.display()))
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
  }

  display() {
    if (!this.isDisplayed) { return }
    this.constructXml()
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  constructXml(): void {
    const list = stats.records.list
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${config.posY} 2">
      ${this.header.constructXml(config.title, config.icon, config.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => a.amount.toString()), list.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}
