import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { ICONS, IDS, Paginator, Grid, centeredText, CONFIG, closeButton, getCpTypes, stringToObjectProperty, GridCellFunction } from '../UiUtils.js'

export default class LocalCps extends PopupWindow {

  private readonly startCellsOnFirstPage: number = 3
  private readonly startCellsOnNextPages: number = 1
  private readonly startCellWidth: number = CONFIG.localCps.startCellWidth
  private readonly indexCellWidth: number = CONFIG.localCps.indexCellWidth
  private readonly cpsOnFirstPage: number = CONFIG.localCps.cpsOnFirstPage
  private readonly cpsOnNextPages: number = this.cpsOnFirstPage + (this.startCellsOnFirstPage - this.startCellsOnNextPages) * this.startCellWidth
  private readonly entries: number = CONFIG.localCps.entries
  private readonly paginator: Paginator
  private readonly cpPaginator: Paginator
  private readonly selfColour: string = CONFIG.localCps.selfColour
  private readonly cpColours = CONFIG.localCps.cpColours

  constructor() {
    super(IDS.localCps, stringToObjectProperty(CONFIG.localCps.icon, ICONS), CONFIG.localCps.title, CONFIG.localCps.navbar)
    const records = TM.records.local
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(records.length / this.entries))
    this.cpPaginator = new Paginator(this.openId + 10, this.windowWidth, this.footerHeight, this.calculateCpPages(), 1, true)
    this.paginator.onPageChange = (login: string): void => {
      this.getPagesAndOpen(login)
    }
    this.cpPaginator.onPageChange = (login: string): void => {
      this.getPagesAndOpen(login)
    }
    TM.addListener('Controller.BeginMap', (): void => {
      this.cpPaginator.setPageCount(this.calculateCpPages())
      this.paginator.setPageCount(Math.ceil(TM.records.local.length / this.entries))
      this.reRender()
    })
    TM.addListener('Controller.PlayerRecord', (): void => {
      this.paginator.setPageCount(Math.ceil(TM.records.local.length / this.entries))
      this.reRender()
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.getPagesAndOpen(info.login)
  }

  protected constructContent(login: string, params: { page: number, cpPage: number }): string {
    const records = TM.records.local
    const [cpIndex, cpsToDisplay] = this.getCpIndexAndAmount(params.cpPage)
    const playerIndex: number = (params.page - 1) * this.entries - 1
    const cpTypes = getCpTypes(records.map(a => a.checkpoints))
    const entriesToDisplay = records.length - (playerIndex + 1)

    const indexCell: GridCellFunction = (i, j, w, h) => centeredText((i + playerIndex + 1).toString(), w, h)

    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(TM.utils.safeString(TM.utils.strip(records[i + playerIndex].nickname, false)), w, h)
    }

    const dateCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(TM.utils.formatDate(records[i + playerIndex].date, true), w, h)
    }

    const loginCell = (i: number, j: number, w: number, h: number): string => {
      let ret: string = centeredText(records[i + playerIndex].login, w, h)
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
        ${centeredText(TM.utils.getTimeString(cp), w, h)}`
    }

    const finishCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(TM.utils.getTimeString(records[i + playerIndex].time), w, h)
    }

    const emptyCell = (): string => ''

    let grid: Grid
    let headers: GridCellFunction[] = []
    if (params.cpPage === 1) {
      headers = [
        (i, j, w, h) => centeredText(' Lp. ', w, h),
        (i, j, w, h) => centeredText(' Nickname ', w, h),
        (i, j, w, h) => centeredText(' Login ', w, h),
        (i, j, w, h) => centeredText(' Date ', w, h),
        ...new Array(cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText((j - this.startCellsOnFirstPage).toString(), w, h)),
        (i, j, w, h) => centeredText(' Finish ', w, h),
        ...new Array(this.cpsOnFirstPage - cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [this.indexCellWidth, ...new Array(this.startCellsOnFirstPage).fill(this.startCellWidth), ...new Array(this.cpsOnFirstPage + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    } else {
      headers = [
        (i, j, w, h) => centeredText(' Lp. ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(' Nickname ', w, h),
        ...new Array(cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText((j + cpIndex - (this.startCellsOnNextPages)).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(' Finish ', w, h),
        ...new Array(this.cpsOnNextPages - cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [this.indexCellWidth, ...new Array(this.startCellsOnNextPages).fill(this.startCellWidth), ...new Array(this.cpsOnNextPages + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    }
    const arr = [...headers]
    for (let i: number = 0; i < entriesToDisplay; i++) {
      if (params.cpPage === 1) {
        arr.push(indexCell, nickNameCell, loginCell, dateCell, ...new Array(cpsToDisplay).fill(cell), finishCell, ...new Array(this.cpsOnFirstPage - cpsToDisplay).fill(emptyCell))
      } else {
        arr.push(indexCell, nickNameCell, ...new Array(cpsToDisplay).fill(cell), finishCell, ...new Array(this.cpsOnNextPages - cpsToDisplay).fill(emptyCell))
      }
    }
    return grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, cpPage: number }): string {
    const w = (this.cpPaginator.buttonW + this.cpPaginator.margin) * this.cpPaginator.buttonCount + CONFIG.localCps.cpPaginatorMargin
    return `${closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin)}
    ${this.paginator.constructXml(params.page)}
    <frame posn="${this.windowWidth / 2 - w} 0 3">
      ${this.cpPaginator.constructXml(params.cpPage)}
    </frame>`
  }

  private getCpIndexAndAmount(cpPage: number): [number, number] {
    const cpAmount = TM.maps.current.checkpointsAmount - 1
    let cpsToDisplay: number = Math.min(cpAmount, this.cpsOnFirstPage)
    let cpIndex: number = 0
    if (cpPage > 1) {
      cpIndex = this.cpsOnFirstPage
      for (let i: number = 2; i < cpPage; i++) {
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
    let cpPages: number = 1
    const cpAmount = TM.maps.current.checkpointsAmount - 1
    for (let i: number = 1; i < cpAmount; i++) {
      if (cpPages === 1 && i >= this.cpsOnFirstPage) {
        cpPages++
      } else if (i >= this.cpsOnFirstPage + this.cpsOnNextPages * (cpPages - 1)) {
        cpPages++
      }
    }
    return cpPages
  }

} 