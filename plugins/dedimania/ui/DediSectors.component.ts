/**
 * @author lythx
 * @since 0.1
 */

import { dedimania, type DediRecord } from '../../dedimania/Dedimania.js'
import { componentIds, Paginator, Grid, centeredText, closeButton, getCpTypes, type GridCellFunction, PopupWindow } from '../../ui/UI.js'
import config from './DediSectors.config.js'

export default class DediSectors extends PopupWindow {

  private readonly startCellsOnFirstPage: number = 2
  private readonly startCellsOnNextPages: number = 1
  private readonly startCellWidth: number = config.startCellWidth
  private readonly indexCellWidth: number = config.indexCellWidth
  private readonly cpsOnFirstPage: number = config.cpsOnFirstPage
  private readonly cpsOnNextPages: number = this.cpsOnFirstPage + (this.startCellsOnFirstPage - this.startCellsOnNextPages) * this.startCellWidth
  private readonly entries: number = config.entries
  private readonly paginator: Paginator
  private readonly cpPaginator: Paginator
  private readonly selfColour: string = config.selfColour
  private readonly cpColours = config.cpColours

  constructor() {
    super(componentIds.dediSectors, config.icon, config.title, config.navbar)
    const records = dedimania.records
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(records.length / this.entries))
    this.cpPaginator = new Paginator(this.openId + 10, this.windowWidth, this.footerHeight, this.calculateCpPages(), 1, true)
    this.paginator.onPageChange = (login: string): void => {
      this.getPagesAndOpen(login)
    }
    this.cpPaginator.onPageChange = (login: string): void => {
      this.getPagesAndOpen(login)
    }
    dedimania.onFetch((): void => {
      this.cpPaginator.setPageCount(this.calculateCpPages())
      this.paginator.setPageCount(Math.ceil(dedimania.recordCount / this.entries))
      this.reRender()
    })
    dedimania.onRecord((): void => {
      this.paginator.setPageCount(Math.ceil(dedimania.recordCount / this.entries))
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

  protected constructContent(login: string, params: { page: number, cpPage: number }): string {
    const records: DediRecord[] = []
    for (const e of dedimania.records) {
      records.push({ ...e, checkpoints: [...e.checkpoints, e.time].map((a, i, arr) => i === 0 ? a : a - arr[i - 1]) })
    }
    const [cpIndex, cpsToDisplay] = this.getCpIndexAndAmount(params.cpPage)
    const playerIndex: number = (params.page - 1) * this.entries - 1
    const cpTypes = getCpTypes(records.map(a => a.checkpoints))
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

    const cell = (i: number, j: number, w: number, h: number): string => {
      const startCells = (params.cpPage === 1 ? this.startCellsOnFirstPage : this.startCellsOnNextPages) + 1
      const record = records[i + playerIndex]
      const cpType = cpTypes[i + playerIndex][j + cpIndex - startCells]
      const colour: string = cpType === undefined ? 'FFFF' : (this.cpColours as any)[cpType]
      const cp = record.checkpoints[(j - startCells) + cpIndex]
      return cp === undefined ? '' : `<format textcolor="${colour}"/>
        ${centeredText(tm.utils.getTimeString(cp), w, h)}`
    }

    const finishCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(tm.utils.getTimeString(records[i + playerIndex].time), w, h)
    }

    const emptyCell = (): string => ''

    let grid: Grid
    let headers: GridCellFunction[] = []
    if (params.cpPage === 1) {
      headers = [
        (i, j, w, h) => centeredText(' Lp. ', w, h),
        (i, j, w, h) => centeredText(' Nickname ', w, h),
        (i, j, w, h) => centeredText(' Login ', w, h),
        ...new Array(cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText((j - this.startCellsOnFirstPage).toString(), w, h)),
        (i, j, w, h) => centeredText(' Finish ', w, h),
        ...new Array(this.cpsOnFirstPage - cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [this.indexCellWidth,
        ...new Array(this.startCellsOnFirstPage).fill(this.startCellWidth),
        ...new Array(this.cpsOnFirstPage + 1).fill(1)], new Array(this.entries + 1).fill(1), config.grid)
    } else {
      headers = [
        (i, j, w, h) => centeredText(' Lp. ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(' Nickname ', w, h),
        ...new Array(cpsToDisplay).fill((i: number, j: number, w: number, h: number): string =>
          centeredText((j + cpIndex - (this.startCellsOnNextPages)).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(' Finish ', w, h),
        ...new Array(this.cpsOnNextPages - cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [this.indexCellWidth,
        ...new Array(this.startCellsOnNextPages).fill(this.startCellWidth), ...new Array(this.cpsOnNextPages + 1).fill(1)],
      new Array(this.entries + 1).fill(1), config.grid)
    }
    const arr = [...headers]
    for (let i = 0; i < entriesToDisplay; i++) {
      if (params.cpPage === 1) {
        arr.push(indexCell, nickNameCell, loginCell, ...new Array(cpsToDisplay).fill(cell), finishCell, ...new Array(this.cpsOnFirstPage - cpsToDisplay).fill(emptyCell))
      } else {
        arr.push(indexCell, nickNameCell, ...new Array(cpsToDisplay).fill(cell), finishCell, ...new Array(this.cpsOnNextPages - cpsToDisplay).fill(emptyCell))
      }
    }
    return grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, cpPage: number }): string {
    const w = (this.cpPaginator.buttonW + this.cpPaginator.margin) * this.cpPaginator.buttonCount + config.cpPaginatorMargin
    return `${closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin)}
    ${this.paginator.constructXml(params.page)}
    <frame posn="${this.windowWidth / 2 - w} 0 3">
      ${this.cpPaginator.constructXml(params.cpPage)}
    </frame>`
  }

  private getCpIndexAndAmount(cpPage: number): [number, number] {
    const cpAmount = dedimania.isUploadingLaps ?
      tm.maps.current.checkpointsPerLap : tm.maps.current.checkpointsAmount
    let cpsToDisplay: number = Math.min(cpAmount, this.cpsOnFirstPage)
    let cpIndex = 0
    if (cpPage > 1) {
      cpIndex = this.cpsOnFirstPage
      for (let i = 2; i < cpPage; i++) {
        cpIndex += this.cpsOnNextPages
      }
      cpsToDisplay = Math.min(cpAmount - cpIndex, this.cpsOnNextPages)
    }
    return [cpIndex, cpsToDisplay]
  }

  private getPagesAndOpen(login: string): void {
    const page = this.paginator.getPageByLogin(login)
    const cpPage = this.cpPaginator.getPageByLogin(login)
    const pageCount: number = this.paginator.pageCount
    this.displayToPlayer(login, { page, cpPage }, `${page}/${Math.max(1, pageCount)}`)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      this.getPagesAndOpen(login)
    }
  }

  private calculateCpPages(): number {
    let cpPages = 1
    const cpAmount = dedimania.isUploadingLaps ?
      tm.maps.current.checkpointsPerLap : tm.maps.current.checkpointsAmount
    for (let i = 1; i < cpAmount; i++) {
      if (cpPages === 1 && i >= this.cpsOnFirstPage) {
        cpPages++
      } else if (i >= this.cpsOnFirstPage + this.cpsOnNextPages * (cpPages - 1)) {
        cpPages++
      }
    }
    return cpPages
  }

}

tm.addListener('Startup', () => {
  new DediSectors()
})