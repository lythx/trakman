import { trakman as tm } from '../../../../src/Trakman.js'
import { RESULTCONFIG as CFG, List, IDS, resultStaticHeader, getResultPosition } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'

export default class RoundAveragesRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.roundAveragesRanking.height
  private readonly entries = CFG.roundAveragesRanking.entries
  private readonly posX: number
  private readonly posY: number
  private readonly list: List
  private readonly side = CFG.roundAveragesRanking.side
  private xml = ''
  private averages: { nickname: string, login: string, average: number, finishcount: number }[] = []

  constructor() {
    super(IDS.roundAveragesRanking, 'result')
    const pos = getResultPosition('roundAveragesRanking')
    this.posX = pos.x
    this.posY = pos.y
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.roundAveragesRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    tm.addListener('Controller.PlayerFinish', async (info) => {
      const entry = this.averages.find(a => a.login === info.login)
      if (entry === undefined) {
        this.averages.push({ nickname: info.nickname, login: info.login, average: info.time, finishcount: 1 })
      } else {
        entry.average = (entry.average * entry.finishcount + info.time) / (entry.finishcount + 1)
        entry.finishcount++
      }
    })
    tm.addListener('Controller.BeginMap', () => {
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
      ${resultStaticHeader(CFG.roundAveragesRanking.title, CFG.roundAveragesRanking.icon, this.side)}
      <frame posn="0 ${-CFG.staticHeader.height - CFG.marginSmall} 2">
        ${this.list.constructXml(this.averages.map(a => tm.utils.getTimeString(a.average)), this.averages.map(a => tm.utils.safeString(tm.utils.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}