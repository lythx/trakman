/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, List, StaticHeader, StaticComponent } from '../../UI.js'
import config from './KarmaRanking.config.js'

export default class KarmaRanking extends StaticComponent {

  private readonly list: List
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(componentIds.karmaRanking, 'result')
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, config.height - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    tm.addListener('KarmaVote', (): void => {
      this.display()
    })
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

  constructXml(): void {
    const list: Readonly<tm.Map>[] = tm.maps.list.sort((a, b): number => b.voteRatio - a.voteRatio).filter(a => a.voteCount > config.minimumVotes).slice(0, config.entries)
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.positionX} ${this.positionY} 2">
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => a.voteRatio === -1 ? config.defaultText : a.voteRatio.toFixed(0)), list.map(a => tm.utils.safeString(tm.utils.strip(a.name, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}