import PopupWindow from "../PopupWindow.js";
import { trakman as tm } from "../../../src/Trakman.js";
import { stats } from "../../stats/Stats.js";
import { IDS, centeredText } from '../UiUtils.js'
import { Paginator, Grid, GridCellFunction, closeButton, GridCellObject } from "../UiUtils.js";
import config from './TopRanks.config.js'

export default class TopRanks extends PopupWindow<number> {

  private readonly paginator: Paginator
  private readonly grid: Grid
  private ranks: { login: string, nickname: string, average: number }[]

  constructor() {
    super(IDS.topRanks, config.icon, config.title, config.navbar)
    this.ranks = stats.averages.list
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.gridColumns,
      new Array((config.entries / 2) + 1).fill(1), config.grid)
    stats.averages.onUpdate((_, list) => {
      this.ranks = list
      this.paginator.setPageCount(Math.ceil(this.ranks.length / config.entries))
      this.reRender()
    })
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(this.ranks.length / config.entries))
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
    tm.commands.add({
      aliases: ['topranks'], // TODO aliases etc
      callback: (info) => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: 0
    })
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, page, `${page}/${this.paginator.pageCount}`)
  }

  protected constructContent(login: string, page?: number): string {
    const columns = 2
    const leftColumns = 3
    const offset = (((page ?? 1) - 1) * config.entries) - 1
    const getIndex = (i: number, j: number) => i + offset + (j > leftColumns ? (config.entries / columns) : 0)
    const arr: (GridCellFunction | GridCellObject)[] = [
      (i, j, w, h) => centeredText('Lp.', w, h),
      (i, j, w, h) => centeredText('Nickname', w, h),
      (i, j, w, h) => centeredText('Login', w, h),
      (i, j, w, h) => centeredText('Average Rank', w, h),
      (i, j, w, h) => centeredText('Lp.', w, h),
      (i, j, w, h) => centeredText('Nickname', w, h),
      (i, j, w, h) => centeredText('Login', w, h),
      (i, j, w, h) => centeredText('Average Rank', w, h)
    ]
    const indexCell: GridCellFunction = (i, j, w, h) => centeredText((getIndex(i, j) + 1).toString(), w, h)
    const nicknameCell: GridCellFunction = (i, j, w, h) =>
      centeredText(tm.utils.safeString(tm.utils.strip(this.ranks[getIndex(i, j)].nickname, false)), w, h)
    const loginCell: GridCellFunction = (i, j, w, h) => {
      const colour = this.ranks[getIndex(i, j)].login === login ? `$${config.selfColour}` : ''
      return centeredText(colour + this.ranks[getIndex(i, j)].login, w, h)
    }
    const averageCell: GridCellFunction = (i, j, w, h) =>
      centeredText(this.ranks[getIndex(i, j)].average.toFixed(config.precision), w, h)
    const emptyCell: GridCellObject = {
      callback: (i, j, w, h) => '',
      background: undefined
    }
    for (let i = 0; i < config.entries / columns; i++) {
      for (let j = 0; j < columns; j++) {
        if (this.ranks[i + offset + 1 + (j === 1 ? (config.entries / columns) : 0)] === undefined) {
          arr.push(emptyCell, emptyCell, emptyCell, emptyCell)
        } else {
          arr.push(indexCell, nicknameCell, loginCell, averageCell)
        }
      }
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }

}