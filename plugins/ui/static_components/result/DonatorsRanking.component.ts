import { IDS, RESULTCONFIG as CFG, List, resultStaticHeader, CONFIG } from '../../UiUtils.js'
import StaticComponent from '../../StaticComponent.js'
import { TRAKMAN as TM } from '../../../../src/Trakman.js'
import { Donations } from '../../../Donations.js'

export default class DonatorsRanking extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height = CFG.donatorsRanking.height
  private readonly entries: number
  private readonly posX = CFG.static.rightPosition - (CFG.static.width + CFG.marginBig)
  private readonly posY = CFG.static.topBorder
  private readonly list: List
  private readonly side = CFG.donatorsRanking.side
  private xml = ''
  private readonly ranking: { nickname: string, amount: number }[] = []

  constructor() {
    super(IDS.donatorsRanking, 'result')
    this.entries = CFG.donatorsRanking.entries
    this.list = new List(this.entries, this.width, this.height - (CFG.staticHeader.height + CFG.marginSmall), CFG.donatorsRanking.columnProportions as any, { background: CFG.static.bgColor, headerBg: CFG.staticHeader.bgColor })
    this.constructXml()
    TM.addListener('Controller.EndMap', async () => {
      const res = await TM.queryDB(`SELECT nickname, time_played FROM players
      JOIN player_ids ON player_ids.id=players.id
      ORDER BY time_played DESC
      LIMIT ${this.entries + 1}`)
      if (res instanceof Error) {
        return ///////
      }
      this.ranking.push(...res.map(a => ({ nickname: a.nickname, amount: Math.round(a.time_played / (60 * 60 * 1000)) })))
      this.display()
    })
    TM.addListener('Controller.BeginMap', () => {
      this.ranking.length = 0
      this.constructXml()
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    this.constructXml()
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    TM.sendManialink(this.xml, login)
  }

  constructXml() {
    this.xml = `<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${this.posX} ${this.posY} 2">
      ${resultStaticHeader(CFG.donatorsRanking.title, CFG.donatorsRanking.icon, this.side)}
      <frame posn="0 ${-CONFIG.staticHeader.height - CONFIG.marginSmall} 2">
        ${this.list.constructXml(this.ranking.map(a => a.amount.toString()), this.ranking.map(a => TM.safeString(TM.strip(a.nickname, false))))}
      </frame>
      </frame>
    </manialink>`
  }

}