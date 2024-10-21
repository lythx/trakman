/**
 * @author lythx
 * @since 0.6
 */

import { stats } from "../../stats/Stats.js"
import { Paginator, Grid, type GridCellFunction, closeButton, type GridCellObject, PopupWindow, componentIds, centeredText } from "../../ui/UI.js"
import config from './TopSums.config.js'

export default class TopSums extends PopupWindow<number> {

  private readonly paginator: Paginator
  private readonly grid: Grid
  private ranks: readonly { login: string, nickname: string, sums: Readonly<[number, number, number, number]> }[]

  constructor() {
    super(componentIds.topSums, config.icon, config.title, config.navbar)
    this.ranks = stats.sums.list
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.gridColumns,
      new Array((config.entries / 2) + 1).fill(1), config.grid)
    stats.sums.onUpdate(() => {
      this.ranks = stats.sums.list
      this.paginator.setPageCount(Math.ceil(this.ranks.length / config.entries))
      this.reRender()
    })
    stats.sums.onNicknameChange(() => {
      this.ranks = stats.sums.list
      this.paginator.setPageCount(Math.ceil(this.ranks.length / config.entries))
      this.reRender()
    })
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(this.ranks.length / config.entries))
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info) => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: config.command.privilege
    })
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, page, `${page}/${this.paginator.pageCount}`)
  }

  protected constructContent(login: string, page?: number): string {
    const columns = 2
    const leftColumns = 6
    const offset = (((page ?? 1) - 1) * config.entries) - 1
    const getIndex = (i: number, j: number) => i + offset + (j > leftColumns ? (config.entries / columns) : 0)
    const arr: (GridCellFunction | GridCellObject)[] = config.headers.map((a) =>
      (i: number, j: number, w: number, h: number) => centeredText(a, w, h))
    const indexCell: GridCellFunction = (i, j, w, h) => centeredText((getIndex(i, j) + 1).toString(), w, h)
    const nicknameCell: GridCellFunction = (i, j, w, h) =>
      centeredText(tm.utils.safeString(tm.utils.strip(this.ranks[getIndex(i, j)].nickname, false)), w, h)
    const loginCell: GridCellFunction = (i, j, w, h) => {
      const colour = this.ranks[getIndex(i, j)].login === login ? `$${config.selfColour} ` : ''
      return centeredText(colour + this.ranks[getIndex(i, j)].login, w, h)
    }
    const firstCell: GridCellFunction = (i, j, w, h) =>
      centeredText('$' + config.colours.gold + this.ranks[getIndex(i, j)].sums[0].toString(), w, h)
    const secondCell: GridCellFunction = (i, j, w, h) =>
      centeredText('$' + config.colours.silver + this.ranks[getIndex(i, j)].sums[1].toString(), w, h)
    const thirdCell: GridCellFunction = (i, j, w, h) =>
      centeredText('$' + config.colours.bronze + this.ranks[getIndex(i, j)].sums[2].toString(), w, h)
    const otherCell: GridCellFunction = (i, j, w, h) =>
      centeredText(this.ranks[getIndex(i, j)].sums[3].toString(), w, h)
    const emptyCell: GridCellObject = {
      callback: (i, j, w, h) => '',
      background: undefined
    }
    for (let i = 0; i < config.entries / columns; i++) {
      for (let j = 0; j < columns; j++) {
        if (this.ranks[i + offset + 1 + (j === 1 ? (config.entries / columns) : 0)] === undefined) {
          arr.push(emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell)
        } else {
          arr.push(indexCell, nicknameCell, loginCell, firstCell, secondCell, thirdCell, otherCell)
        }
      }
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }

}