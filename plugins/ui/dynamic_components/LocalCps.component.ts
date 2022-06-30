import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { ICONS, IDS, Paginator, Grid, centeredText, CONFIG, closeButton, getCpTypes, stringToObjectProperty } from '../UiUtils.js'

export default class LocalCps extends PopupWindow {

  readonly cpsPerPage: number = CONFIG.localCps.cpsPerPage
  readonly entries: number = CONFIG.localCps.entries
  readonly paginator: Paginator
  readonly cpPaginator: Paginator
  readonly selfColour: string = CONFIG.localCps.selfColour
  readonly colours = {
    best: '0F0F',
    worst: 'F00F',
    equal: 'FF0F'
  }
  readonly paginatorOffset: number = CONFIG.localCps.paginatorOffset
  cpAmount: number

  constructor() {
    super(IDS.LocalCps, stringToObjectProperty(CONFIG.localCps.icon, ICONS), CONFIG.localCps.title, [{ name: 'Dedi Sectors', action: 6969696 }, { name: 'Local Checkpoints', action: IDS.LocalCps }, { name: 'Local Sectors', action: 6969696 }, { name: 'Local Checkpoints', action: IDS.LocalCps }, { name: 'Local Sectors', action: 6969696 }])
    const records: LocalRecord[] = TM.localRecords
    this.cpAmount = TM.map.checkpointsAmount - 1
    this.paginator = new Paginator(this.openId, this.windowWidth, this.headerHeight - this.margin, Math.ceil(records.length / this.entries))
    this.paginator.onPageChange((login: string, page: number): void => {
      const records: LocalRecord[] = TM.localRecords
      const pageCount: number = this.paginator.pageCount
      const cpPage: number = this.cpPaginator.getPageByLogin(login) ?? 1
      this.displayToPlayer(login, { page, cpPage, records }, `${page}/${Math.max(1, pageCount)}`)
    })
    let cpPages: number = 1
    for (let i: number = 0; i < this.cpAmount; i++) {
      if (cpPages == 1 && i > this.cpsPerPage * cpPages) {
        cpPages++
      } else if (i > (this.cpsPerPage + 2) * cpPages) {
        cpPages++
      }
    }
    this.cpPaginator = new Paginator(this.openId + 10, this.windowWidth / 10, this.headerHeight - this.margin, cpPages, 1, true)
    this.cpPaginator.onPageChange((login: string, cpPage: number): void => {
      const records: LocalRecord[] = TM.localRecords
      const pageCount: number = this.paginator.pageCount
      const page: number = this.paginator.getPageByLogin(login) ?? 1
      this.displayToPlayer(login, { page, cpPage, records }, `${page}/${Math.max(1, pageCount)}`)
    })
    TM.addListener('Controller.BeginMap', (): void => {
      this.cpAmount = TM.map.checkpointsAmount
      this.paginator.updatePageCount(Math.ceil(TM.localRecords.length / this.entries))
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const records: LocalRecord[] = TM.localRecords
    const pageCount: number = this.paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, cpPage: 1, records }, `1/${Math.max(1, pageCount)}`)
  }

  protected constructContent(login: string, params: { page: number, cpPage: number, records: LocalRecord[] }): string {
    let cpsDisplay: number = Math.min(this.cpAmount, this.cpsPerPage)
    let cpIndex: number = 0
    if (params.cpPage > 1) {
      cpIndex = this.cpsPerPage + 2
      for (let i: number = 2; i < params.cpPage; i++) {
        cpIndex += this.cpsPerPage + 3
      }
      cpsDisplay = Math.min(this.cpAmount - (cpIndex - 2), this.cpsPerPage + 3)
    }
    const n: number = (params.page - 1) * this.entries - 1
    const cpTypes = getCpTypes(params.records.map(a => a.checkpoints))
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      if (params.records?.[i + n] === undefined) { return '' }
      return centeredText(CONFIG.static.format + TM.strip(params.records[i + n].nickName, false), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      if (params.records?.[i + n] === undefined) { return '' }
      let ret: string = centeredText(CONFIG.static.format + params.records[i + n].login, w, h)
      if (login === params.records[i + n].login) {
        return `<format textcolor="${this.selfColour}"/>` + ret
      }
      return ret
    }
    const dateCell = (i: number, j: number, w: number, h: number): string => {
      if (params.records?.[i + n] === undefined) { return '' }
      return centeredText(CONFIG.static.format + TM.formatDate(params.records[i + n].date, true), w, h)
    }
    const cell = (i: number, j: number, w: number, h: number): string => {
      const record: LocalRecord = params.records?.[i + n]
      if (record === undefined) {
        return ''
      }
      const type = cpTypes?.[i + n]?.[j + cpIndex - 3]
      let colour: string = 'FFFF'
      if (type !== undefined) {
        colour = (this.colours as any)[type]
      }
      if (((j - 3 === this.cpsPerPage && params.cpPage === 1) || (j - 4 === this.cpsPerPage && params.cpPage !== 1))
        && record?.checkpoints?.[(j - 3) + cpIndex] !== undefined) {
        return centeredText(CONFIG.static.format + TM.Utils.getTimeString(record.time), w, h)
      }
      if (record?.checkpoints?.[(j - 3) + cpIndex] === undefined) {
        if (record?.checkpoints?.[(j - 4) + cpIndex] !== undefined) {
          return `<format textcolor="${colour}"/>
            ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(record.time), w, h)}`
        }
        return ''
      }
      return `<format textcolor="${colour}"/>
        ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(record.checkpoints[(j - 3) + cpIndex]), w, h)}`
    }
    let grid: Grid
    let headers: ((i: number, j: number, w: number, h: number) => string)[]
    if (params.cpPage === 1) {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Login', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Date', w, h),
        ...new Array(cpsDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j - 2).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.cpsPerPage - cpsDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth - this.margin, this.contentHeight - this.margin * 2, [2, 2, 2, ...new Array(this.cpsPerPage + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg })
    } else {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        ...new Array(cpsDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + ((j - 2) + cpIndex).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array((this.cpsPerPage + 4) - cpsDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth - this.margin, this.contentHeight - this.margin * 2, [2, ...new Array(this.cpsPerPage + 5).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg })
    }
    const arr = [...headers]
    for (let i: number = 0; i < params.records.length; i++) {
      if (params.cpPage === 1) {
        arr.push(nickNameCell, loginCell, dateCell, ...new Array(this.cpsPerPage + 1).fill(cell))
      } else {
        arr.push(nickNameCell, ...new Array(this.cpsPerPage + 5).fill(cell))
      }
    }
    return `<frame posn="0 ${-this.margin} 3">
    ${grid.constructXml(arr)}
    </frame>`
  }

  protected constructFooter(login: string, params: { page: number, cpPage: number }): string {
    return `${closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin)}
    ${this.paginator.constructXml(params.page)}
    <frame posn="${this.windowWidth - this.paginatorOffset} 0 3">
      ${this.cpPaginator.constructXml(params.cpPage)}
    </frame>`
  }
} 