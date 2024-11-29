/**
 * @author lythx
 * @since 1.5.0
 */

import { ultimania } from "../Ultimania.js"
import { componentIds, Paginator, Grid, centeredText, closeButton, type GridCellFunction, PopupWindow } from '../../ui/UI.js'
import config from './UltiRecords.config.js'

export default class UltiRecords extends PopupWindow {

  private readonly entries: number = config.entries
  private readonly paginator: Paginator
  private readonly selfColour: string = config.selfColour

  constructor() {
    super(componentIds.ultiRecords, config.icon, config.title, config.navbar)
    const records = ultimania.records
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(records.length / this.entries))
    this.paginator.onPageChange = (login: string): void => {
      this.getPagesAndOpen(login)
    }
    ultimania.onFetch((): void => {
      this.paginator.setPageCount(Math.ceil(ultimania.recordCount / this.entries))
      this.reRender()
    })
    ultimania.onRecord((): void => {
      this.paginator.setPageCount(Math.ceil(ultimania.recordCount / this.entries))
      this.reRender()
    })
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.command.privilege
    })
    tm.addListener('PlayerDataUpdated', () => this.reRender())
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    this.getPagesAndOpen(info.login)
  }

  protected constructContent(login: string, params: { page: number }): string {
    const records = ultimania.records
    const playerIndex: number = (params.page - 1) * this.entries - 1
    const entriesToDisplay = records.length - (playerIndex + 1)

    const indexCell: GridCellFunction = (i, j, w, h) => centeredText((i + playerIndex + 1).toString(), w, h)

    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(tm.utils.safeString(tm.utils.strip(records[i + playerIndex].nickname, false)), w, h)
    }

    const loginCell = (i: number, j: number, w: number, h: number): string => {
      const ret: string = centeredText(records[i + playerIndex].login, w, h)
      if (login === records[i + playerIndex].login) { // Add colour for yourself
        return `<format textcolor="${this.selfColour}"/>` + ret
      }
      return ret
    }


    const dateCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(tm.utils.formatDate(records[i + playerIndex].date, true), w, h)
    }

    const finishCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(tm.utils.getTimeString(records[i + playerIndex].score), w, h)
    }

    let grid: Grid
    let headers: GridCellFunction[] = []
    headers = [
      (i, j, w, h) => centeredText(' Lp. ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Date ', w, h),
      (i, j, w, h) => centeredText(' Score ', w, h),
    ]
    grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(this.entries + 1).fill(1), config.grid)
    const arr = [...headers]
    for (let i = 0; i < entriesToDisplay; i++) {
      arr.push(indexCell, nickNameCell, loginCell, dateCell, finishCell)
    }
    return grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }

  private getPagesAndOpen(login: string): void {
    const page = this.paginator.getPageByLogin(login)
    const pageCount: number = this.paginator.pageCount
    this.displayToPlayer(login, { page }, `${page}/${Math.max(1, pageCount)}`)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      this.getPagesAndOpen(login)
    }
  }

}

tm.addListener('Startup', () => {
  new UltiRecords()
})