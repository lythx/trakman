import config from './ServerLinks.config.js'
import { StaticComponent, StaticHeader, componentIds, Grid, GridCellFunction, centeredText } from '../../ui/UI.js'
import { ServerInfo } from '../ServerLinks.js'

export default class ServerLinks extends StaticComponent {

  private readonly header: StaticHeader
  private readonly grid: Grid
  private serverList: ServerInfo[] = []

  constructor() {
    super(componentIds.serverLinks, 'race')
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width, config.height - (this.header.options.height + config.margin),
      [1], new Array(config.entries).fill(1), config.grid)
  }

  update(newList: ServerInfo[]) {
    this.serverList = newList
    this.display()
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const player of tm.players.list) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.localCps })}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${this.constructEntries()}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private constructEntries() {
    const cell: GridCellFunction = (i, j, w, h) => {
      const data = this.serverList[i]
      return `<quad posn="0 0 1" sizen="${w} ${h - config.margin}" bgcolor="${config.background}"/>
      ${centeredText(data.name + data.environment + data.gameMode + data.playerCount +
        data.maxLadderLimit + data.minLadderLimit, w, h)}`
    }
    const functions: GridCellFunction[] = []
    for (let i = 0; i < this.serverList.length; i++) {
      functions.push(cell)
    }
    return this.grid.constructXml(functions)
  }

}
