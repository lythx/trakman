import config from './ServerLinks.config.js'
import { StaticComponent, StaticHeader, componentIds, Grid, GridCellFunction, centeredText, leftAlignedText } from '../../ui/UI.js'
import { ServerInfo } from '../ServerLinks.js'

export default class ServerLinks extends StaticComponent {

  private readonly header: StaticHeader
  private readonly grid: Grid
  private serverList: ServerInfo[] = []
  private readonly gameModeMap: { [gameMode in tm.GameMode]: string } = {
    TimeAttack: 'TA',
    Rounds: 'RND',
    Teams: 'TEAM',
    Cup: 'CUP',
    Laps: 'LAP',
    Stunts: 'STNT'
  }

  constructor() {
    super(componentIds.serverLinks, 'race')
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width,
      config.height - this.header.options.height,
      [1], new Array(config.entries).fill(1))
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
    const functions: GridCellFunction[] = []
    for (let i = 0; i < this.serverList.length; i++) {
      functions.push(this.constructEntry.bind(this))
    }
    tm.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side, { actionId: componentIds.localCps })}
        <frame posn="0 ${-this.header.options.height} 1">
          ${this.grid.constructXml(functions)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private constructEntry(ii: number, jj: number, ww: number, hh: number): string {
    const data = this.serverList[ii]
    const m = config.margin
    const arr: GridCellFunction[] = [
      (i, j, w, h): string => {
        return `${this.icon(icons.name, iw, h)}
        ${this.text(tm.utils.strip(data.name, false), w - iw - m, h, iw + m, config.iconBackground, true)}`
      },
      (i, j, w, h): string => {
        const width = 7
        return `${this.icon(icons.map, iw, h)}
        ${this.text(data.currentMap, width, h, iw + m)}
        ${this.icon(icons.playerCount, iw, h, iw + width + 2 * m)}
        ${this.text(`${data.playerCount}/${data.maxPlayerCount}`, w - (2 * iw + width + 3 * m), h, 2 * iw + width + 3 * m)}`
      },
      (i, j, w, h): string => {
        const width = 7
        return `${this.icon(icons.author, iw, h)}
        ${this.text(data.currentMapAuthor, width, h, iw + m)}
        ${this.icon(icons.gameMode, iw, h, iw + width + 2 * m)}
        ${this.text(this.gameModeMap[data.gameMode], w - (2 * iw + width + 3 * m), h, 2 * iw + width + 3 * m)}`
      }
    ]
    const iw = config.iconWidth
    const icons = config.icons
    const grid = new Grid(ww + config.margin * 2, hh + config.margin, [1], new Array(3).fill(1), { margin: config.margin })
    return `<frame posn="${-config.margin} 0 2">${grid.constructXml(arr)}</frame>`
  }

  private icon(url: string, w: number, h: number, xOffset: number = 0): string {
    return `<quad posn="${xOffset} 0 3" sizen="${w} ${h}" bgcolor="${config.iconBackground}"/>
    <quad posn="${config.margin + xOffset} ${-config.margin} 4" sizen="${w - config.margin * 2} ${h - config.margin * 2}" 
     image="${url}"/>`
  }

  private text(text: string, w: number, h: number, xOffset: number = 0, background?: string, leftAligned?: boolean): string {
    xOffset = xOffset ?? 0 
    return `<quad posn="${xOffset ?? 0} 0 2" sizen="${w} ${h}" bgcolor="${background ?? config.textBackground}"/>
    ${leftAligned ? leftAlignedText(text, w, h, 
      { textScale: config.textScale, padding: config.textPadding, xOffset: xOffset+ config.margin, })
      : centeredText(text, w, h, { textScale: config.textScale, padding: config.textPadding, xOffset })}`
  }

}
