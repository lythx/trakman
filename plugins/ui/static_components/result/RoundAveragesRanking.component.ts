/**
 * @author lythx
 * @since 0.4
 */

import { List, componentIds, StaticHeader, StaticComponent } from '../../UI.js'
import config from './RoundAveragesRanking.config.js'

export default class RoundAveragesRanking extends StaticComponent {

  private readonly list: List
  private readonly header: StaticHeader
  private xml: string = ''
  private averages: { nickname: string, login: string, average: number, finishcount: number }[] = []

  constructor() {
    super(componentIds.roundAveragesRanking)
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, this.getHeight() - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    tm.addListener('PlayerFinish', async (info): Promise<void> => {
      const entry = this.averages.find(a => a.login === info.login)
      if (entry === undefined) {
        this.averages.push({ nickname: info.nickname, login: info.login, average: info.time, finishcount: 1 })
      } else {
        entry.average = ~~((entry.average * entry.finishcount + info.time) / (entry.finishcount + 1))
        entry.finishcount++
      }
      this.averages.sort((a, b): number => a.average - b.average)
    })
    tm.addListener('BeginMap', (): void => {
      this.averages.length = 0
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      if (this.averages.some(a => info.some(b => b.login === a.login))) { return this.display() }
    })
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
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.positionX} ${this.positionY} 2">
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(this.averages.map(a => tm.utils.getTimeString(a.average)), this.averages.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}
