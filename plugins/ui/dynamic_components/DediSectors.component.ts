import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { ICONS, IDS, Paginator, Grid, centeredText, CONFIG, closeButton, getCpTypes, stringToObjectProperty } from '../UiUtils.js'

export default class DediSectors extends PopupWindow {

  private readonly startCellsOnFirstPage: number = 2
  private readonly startCellsOnNextPages: number = 1
  private readonly startCellWidth: number = 2
  private readonly secsOnFirstPage: number = CONFIG.dediSectors.sectorsOnFirstPage
  private readonly secsOnNextPages: number = this.secsOnFirstPage + (this.startCellsOnFirstPage - this.startCellsOnNextPages) * this.startCellWidth
  private readonly entries: number = CONFIG.dediSectors.entries
  private readonly paginator: Paginator
  private readonly secPaginator: Paginator
  private readonly selfColour: string = CONFIG.dediSectors.selfColour
  private readonly secColours = CONFIG.dediSectors.sectorColours

  constructor() {
    super(IDS.dediSectors, stringToObjectProperty(CONFIG.dediSectors.icon, ICONS), CONFIG.dediSectors.title, CONFIG.dediSectors.navbar)
    const records: TMDedi[] = TM.dediRecords
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(records.length / this.entries))
    this.secPaginator = new Paginator(this.openId + 10, this.windowWidth, this.footerHeight, this.calculateSecPages(), 1, true)
    this.paginator.onPageChange=(login: string): void => {
      this.getPagesAndOpen(login)
    }
    this.secPaginator.onPageChange=(login: string): void => {
      this.getPagesAndOpen(login)
    }
    TM.addListener('Controller.BeginMap', (): void => {
      this.secPaginator.updatePageCount(this.calculateSecPages())
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

  protected constructContent(login: string, params: { page: number, secPage: number }): string {
    const records = TM.dediRecords
    const secRecords: TMDedi[] = []
    for (const e of records) {
      secRecords.push({
        login: e.login,
        nickname: e.nickname,
        time: e.time,
        checkpoints: [...e.checkpoints, e.time].reduce((acc: number[], cur, i, arr) => i === 0 ? [cur] : [...acc, cur - arr[i - 1]], [])
      })
    }
    const [secIndex, secsToDisplay] = this.getSecIndexAndAmount(params.secPage)
    const playerIndex: number = (params.page - 1) * this.entries - 1
    const secTypes = getCpTypes(secRecords.map(a => a.checkpoints))
    const entriesToDisplay = secRecords.length - (playerIndex + 1)

    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(CONFIG.static.format + TM.strip(secRecords[i + playerIndex].nickname, false), w, h)
    }

    const loginCell = (i: number, j: number, w: number, h: number): string => {
      let ret: string = centeredText(CONFIG.static.format + secRecords[i + playerIndex].login, w, h)
      if (login === secRecords[i + playerIndex].login) { // Add colour for yourself
        return `<format textcolor="${this.selfColour}"/>` + ret
      }
      return ret
    }

    const cell = (i: number, j: number, w: number, h: number): string => {
      const startCells = params.page === 1 ? this.startCellsOnFirstPage : this.startCellsOnNextPages
      const record: TMDedi = secRecords[i + playerIndex]
      const secType = secTypes[i + playerIndex][j + secIndex - startCells]
      const colour: string = secType === undefined ? 'FFFF' : (this.secColours as any)[secType]
      const sec = record.checkpoints[(j - startCells) + secIndex]
      return sec === undefined ? '' : `<format textcolor="${colour}"/>
        ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(sec), w, h)}`
    }

    const finishCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(CONFIG.static.format + TM.Utils.getTimeString(secRecords[i + playerIndex].time), w, h)
    }

    const emptyCell = (): string => ''

    let grid: Grid
    let headers: ((i: number, j: number, w: number, h: number) => string)[]
    if (params.secPage === 1) {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Login', w, h),
        ...new Array(secsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j + 1 - this.startCellsOnFirstPage).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.secsOnFirstPage - secsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [...new Array(this.startCellsOnFirstPage).fill(this.startCellWidth), ...new Array(this.secsOnFirstPage + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    } else {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        ...new Array(secsToDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j + secIndex - this.startCellsOnNextPages).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.secsOnNextPages - secsToDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [...new Array(this.startCellsOnNextPages).fill(this.startCellWidth), ...new Array(this.secsOnNextPages + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    }
    const arr = [...headers]
    for (let i: number = 0; i < entriesToDisplay; i++) {
      if (params.secPage === 1) {
        arr.push(nickNameCell, loginCell, ...new Array(secsToDisplay).fill(cell), finishCell, ...new Array(this.secsOnFirstPage - secsToDisplay).fill(emptyCell))
      } else {
        arr.push(nickNameCell, ...new Array(secsToDisplay).fill(cell), finishCell, ...new Array(this.secsOnNextPages - secsToDisplay).fill(emptyCell))
      }
    }
    return grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, secPage: number }): string {
    const w = (this.secPaginator.buttonW + this.secPaginator.margin) * this.secPaginator.buttonCount + CONFIG.dediSectors.sectorPaginatorMargin
    return `${closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin)}
    ${this.paginator.constructXml(params.page)}
    <frame posn="${this.windowWidth / 2 - w} 0 3">
      ${this.secPaginator.constructXml(params.secPage)}
    </frame>`
  }

  private getSecIndexAndAmount(secPage: number): [number, number] {
    const secAmount = TM.map.checkpointsAmount
    let secsToDisplay: number = Math.min(secAmount, this.secsOnFirstPage)
    let secIndex: number = 0
    if (secPage > 1) {
      secIndex = this.secsOnFirstPage + 1
      for (let i: number = 2; i < secPage; i++) {
        secIndex += this.secsOnNextPages
      }
      secsToDisplay = Math.min(secAmount - (secIndex - 1), this.secsOnNextPages)
    }
    return [secIndex, secsToDisplay]
  }

  private getPagesAndOpen(login: string): void {
    const page = this.paginator.getPageByLogin(login)
    const secPage = this.secPaginator.getPageByLogin(login)
    const pageCount: number = this.paginator.pageCount
    this.displayToPlayer(login, { page, secPage }, `${page}/${Math.max(1, pageCount)}`)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      this.getPagesAndOpen(login)
    }
  }

  private calculateSecPages(): number {
    let secPages: number = 1
    const secAmount = TM.map.checkpointsAmount
    for (let i: number = 1; i < secAmount; i++) {
      if (secPages === 1 && i >= this.secsOnFirstPage) {
        secPages++
      } else if (i >= this.secsOnFirstPage + this.secsOnNextPages * (secPages - 1)) {
        secPages++
      }
    }
    return secPages
  }

} 