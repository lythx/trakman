import { IDS, List, StaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import config from './KarmaRanking.config.js'

export default class KarmaRanking extends StaticComponent {

  private readonly posX: number
  private readonly posY: number
  private readonly side: boolean
  private readonly list: List
  private readonly header: StaticHeader
  private xml = ''

  constructor() {
    super(IDS.karmaRanking, 'result')
    const pos = this.getRelativePosition()
    this.posX = pos.x
    this.posY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, config.height - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    tm.addListener('KarmaVote', () => {
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

  constructXml() {
    const list = tm.maps.list.sort((a, b) => b.voteRatio - a.voteRatio).filter(a => a.voteCount > config.minimumVotes).slice(0, config.entries)
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(list.map(a => Math.round(a.voteRatio).toString()), list.map(a => tm.utils.safeString(tm.utils.strip(a.name, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}