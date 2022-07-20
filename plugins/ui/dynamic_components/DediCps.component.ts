import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { ICONS, IDS, Paginator, Grid, centeredText, CONFIG, closeButton, getCpTypes, stringToObjectProperty } from '../UiUtils.js'

export default class DediCps extends PopupWindow {

  private readonly startCellsOnFirstPage: number = 2
  private readonly startCellsOnNextPages: number = 1
  private readonly startCellWidth: number = 2
  private readonly cpsOnFirstPage: number = CONFIG.dediCps.cpsOnFirstPage
  private readonly cpsOnNextPages: number = this.cpsOnFirstPage + (this.startCellsOnFirstPage - this.startCellsOnNextPages) * this.startCellWidth
  private readonly entries: number = CONFIG.dediCps.entries
  private readonly paginator: Paginator
  private readonly cpPaginator: Paginator
  private readonly selfColour: string = CONFIG.dediCps.selfColour
  private readonly cpColours = CONFIG.dediCps.cpColours

  constructor() {
    super(IDS.dediCps, stringToObjectProperty(CONFIG.dediCps.icon, ICONS), CONFIG.dediCps.title, CONFIG.dediCps.navbar)
    const records: TMDedi[] = TM.dediRecords
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(records.length / this.entries))
    this.cpPaginator = new Paginator(this.openId + 10, this.windowWidth, this.footerHeight, this.calculateCpPages(), 1, true)
    this.paginator.onPageChange((login: string): void => {
      this.getPagesAndOpen(login)
    })
    this.cpPaginator.onPageChange((login: string): void => {
      this.getPagesAndOpen(login)
    })
    TM.addListener('Controller.BeginMap', (): void => {
      this.cpPaginator.updatePageCount(this.calculateCpPages())
      this.paginator.updatePageCount(Math.ceil(TM.dediRecords.length / this.entries))
      this.reRender()
    })
    TM.addListener('Controller.PlayerFinish', (): void => {
      this.paginator.updatePageCount(Math.ceil(TM.dediRecords.length / this.entries))
      this.reRender()
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.getPagesAndOpen(info.login)
  }

  protected constructContent(login: string, params: { page: number, cpPage: number }): string {
    const records = TM.dediRecords
    const [cpIndex, cpsToDisplay] = this.getCpIndexAndAmount(params.cpPage)
    const playerIndex: number = (params.page - 1) * this.entries - 1
    const cpTypes = getCpTypes(records.map(a => a.checkpoints))
    const entriesToDisplay = records.length - (playerIndex + 1)

    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(CONFIG.static.format + TM.strip(records[i + playerIndex].nickname, false), w, h)
    }

    const loginCell = (i: number, j: number, w: number, h: number): string => {
      let ret: string = centeredText(CONFIG.static.format + records[i + playerIndex].login, w, h)
      if (login === records[i + playerIndex].login) { // Add colour for yourself
        return `<format textcolor="${this.selfColour}"/>` + ret
      }
      return ret
    }

    const cell = (i: number, j: number, w: number, h: number): string => {
      const startCells = params.page === 1 ? this.startCellsOnFirstPage : this.startCellsOnNextPages
      const record: TMDedi = records[i + playerIndex]
      const cpType = cpTypes[i + playerIndex][j + cpIndex - startCells]
      const colour: string = cpType === undefined ? 'FFFF' : (this.cpColours as any)[cpType]
      const cp = record.checkpoints[(j - startCells) + cpIndex]
      return cp === undefined ? '' : `<format textcolor="${colour}"/>
        ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(cp), w, h)}`
    }

    const finishCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(CONFIG.static.format + TM.Utils.getTimeString(records[i + playerIndex].time), w, h)
    }

    const emptyCell = (): string => ''

    let grid: Grid
    let headers: ((i: number, j: number, w: number, h: number) => string)[]
    if (params.cpPage === 1) {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Login', w, h),
        ...new Array(cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j + 1 - this.startCellsOnFirstPage).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.cpsOnFirstPage - cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [...new Array(this.startCellsOnFirstPage).fill(this.startCellWidth), ...new Array(this.cpsOnFirstPage + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    } else {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        ...new Array(cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j + cpIndex - this.startCellsOnNextPages).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.cpsOnNextPages - cpsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [...new Array(this.startCellsOnNextPages).fill(this.startCellWidth), ...new Array(this.cpsOnNextPages + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    }
    const arr = [...headers]
    for (let i: number = 0; i < entriesToDisplay; i++) {
      if (params.cpPage === 1) {
        arr.push(nickNameCell, loginCell, ...new Array(cpsToDisplay).fill(cell), finishCell, ...new Array(this.cpsOnFirstPage - cpsToDisplay).fill(emptyCell))
      } else {
        arr.push(nickNameCell, ...new Array(cpsToDisplay).fill(cell), finishCell, ...new Array(this.cpsOnNextPages - cpsToDisplay).fill(emptyCell))
      }
    }
    return grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, cpPage: number }): string {
    const w = (this.cpPaginator.buttonW + this.cpPaginator.margin) * this.cpPaginator.buttonCount + CONFIG.dediCps.cpPaginatorMargin
    return `${closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin)}
    ${this.paginator.constructXml(params.page)}
    <frame posn="${this.windowWidth / 2 - w} 0 3">
      ${this.cpPaginator.constructXml(params.cpPage)}
    </frame>`
  }

  private getCpIndexAndAmount(cpPage: number): [number, number] {
    const cpAmount = TM.map.checkpointsAmount - 1
    let cpsToDisplay: number = Math.min(cpAmount, this.cpsOnFirstPage)
    let cpIndex: number = 0
    if (cpPage > 1) {
      cpIndex = this.cpsOnFirstPage + 1
      for (let i: number = 2; i < cpPage; i++) {
        cpIndex += this.cpsOnNextPages
      }
      cpsToDisplay = Math.min(cpAmount - (cpIndex - 1), this.cpsOnNextPages)
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
    const cpAmount = TM.map.checkpointsAmount - 1
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