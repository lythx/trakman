/**
 * @author lythx
 * @since 1.2
 */
import { componentIds, StaticHeader, centeredText, StaticComponent, GridCellFunction, Grid } from '../../UI.js'
import config from './TeamScore.config.js'

export default class TeamScore extends StaticComponent {

  private readonly header: StaticHeader
  private readonly grid: Grid
  private xml: string = ''

  constructor(private maxScore = tm.rounds.teamsPointsLimit) {
    super(componentIds.teamScore, 'race', ['Teams'])
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width + config.margin * 2, config.height + config.margin - this.header.options.height,
      new Array(3).fill(1), [1], { margin: config.margin })
    tm.addListener('BeginMap', () => {
      this.maxScore = tm.rounds.teamsPointsLimit
    })
    tm.addListener('EndRound', () => this.display())
    tm.addListener('BeginRound', () => this.display())
    tm.addListener('PlayerFinish', () => this.display())
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

  private constructXml() {
    const colours = [config.colours.left, config.colours.middle, config.colours.right]
    const teamScores = tm.records.teamScores
    const data = [teamScores.blue, this.maxScore === 0 ? config.noMaxScore : 0, teamScores.red]
    const cell: GridCellFunction = (i, j, w, h) => {
      return `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${colours[j]}"/>
      ${centeredText(data[j].toString(), w, h, config.text)}`
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="${-config.margin} ${-(this.header.options.height)} 1">
          ${this.grid.constructXml([cell, cell, cell])}
        </frame>
      </frame>
    </manialink>`
  }

  protected onPositionChange(): void {
    this.display()
  }

}
