import { trakman as tm } from '../../../../src/Trakman.js'
import { List, IDS, StaticHeader } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import config from './RoundAveragesRanking.config.js'

export default class RoundAveragesRanking extends StaticComponent {

  private readonly posX: number
  private readonly posY: number
  private readonly list: List
  private readonly side: boolean
  private readonly header: StaticHeader
  private xml = ''
  private averages: { nickname: string, login: string, average: number, finishcount: number }[] = []

  constructor() {
    super(IDS.roundAveragesRanking, 'result')
    const pos = this.getRelativePosition()
    this.posX = pos.x
    this.posY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('result')
    this.list = new List(config.entries, config.width, config.height - (this.header.options.height + config.margin),
      config.columnProportions, { background: config.background, headerBg: this.header.options.textBackground })
    tm.addListener('PlayerFinish', async (info) => {
      const entry = this.averages.find(a => a.login === info.login)
      if (entry === undefined) {
        this.averages.push({ nickname: info.nickname, login: info.login, average: info.time, finishcount: 1 })
      } else {
        entry.average = (entry.average * entry.finishcount + info.time) / (entry.finishcount + 1)
        entry.finishcount++
      }
    })
    tm.addListener('BeginMap', () => {
      this.averages.length = 0
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
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${this.header.constructXml(config.title, config.icon, this.side)}
      <frame posn="0 ${-this.header.options.height - config.margin} 2">
        ${this.list.constructXml(this.averages.map(a => tm.utils.getTimeString(a.average)), this.averages.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}