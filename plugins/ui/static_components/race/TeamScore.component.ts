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
    super(componentIds.teamScore)
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width + config.margin * 2, config.height + config.margin - this.header.options.height,
      new Array(3).fill(1), [1], { margin: config.margin })
    tm.addListener('BeginMap', () => {
      this.maxScore = tm.rounds.teamsPointsLimit
    })
    this.renderOnEvent('EndRound', () => this.display())
    this.renderOnEvent('BeginRound', () => this.display())
    this.renderOnEvent('PlayerFinish', () => this.display())
  }

  getHeight(): number {
    return config.height
  }

  display(): string | void {
    if (!this.isDisplayed) { return }
    this.constructXml()
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  private constructXml() {
    const colours = [config.colours.left, config.colours.middle, config.colours.right]
    const teamScores = tm.rounds.teamScores
    const data = [teamScores.blue, this.maxScore === 0 ? config.noMaxScore : this.maxScore, teamScores.red]
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
