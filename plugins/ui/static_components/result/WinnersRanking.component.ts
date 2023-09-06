/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, List, StaticHeader, StaticComponent } from '../../UI.js'
import { stats } from '../../../stats/Stats.js'
import config from './WinnersRanking.config.js'

export default class WinnersRanking extends StaticComponent {

  private readonly header: StaticHeader
  private readonly list: List
  private xml: string = ''

  constructor() {
    super(componentIds.winnersRanking)
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    stats.wins.onUpdate(() => {
      const xml = this.display()
      if (xml !== undefined) { tm.sendManialink(xml) }
    })
    stats.wins.onNicknameChange(() => {
      const xml = this.display()
      if (xml !== undefined) { tm.sendManialink(xml) }
    })
  }

  getHeight(): number {
    return config.entryHeight * config.entries + StaticHeader.raceHeight + config.margin
  }

  display(): void | string {
    if (!this.isDisplayed) { return }
    this.constructXml()
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  constructXml(): void {
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
