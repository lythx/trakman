import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { ICONS, IDS, Paginator, Grid, centeredText, CONFIG, closeButton, getCpTypes, stringToObjectProperty } from '../UiUtils.js'

export default class DediSectors extends PopupWindow {

  readonly sectorsPerPage: number = CONFIG.dediSectors.cpsPerPage
  readonly entries: number = CONFIG.dediSectors.entries
  readonly paginator: Paginator
  readonly cpPaginator: Paginator
  readonly selfColour = CONFIG.dediSectors.selfColour
  readonly colours = {
    best: '0F0F',
    worst: 'F00F',
    equal: 'FF0F'
  }
  readonly paginatorOffset = CONFIG.dediSectors.paginatorOffset
  cpAmount: number

  constructor() {
    super(IDS.DediSectors, stringToObjectProperty(CONFIG.dediSectors.icon, ICONS), CONFIG.dediSectors.title, [{ name: 'Dedi Sectors', action: 6969696 }, { name: 'Local Checkpoints', action: IDS.LocalCps }, { name: 'Local Sectors', action: 6969696 }, { name: 'Live Checkpoints', action: IDS.LocalCps }, { name: 'Live Sectors', action: 6969696 }])
    const dedis = TM.dediRecords
    this.cpAmount = TM.map.checkpointsAmount - 1
    this.paginator = new Paginator(this.openId, this.windowWidth, this.headerHeight - this.margin, Math.ceil(dedis.length / this.entries))
    this.paginator.onPageChange((login: string, page: number) => {
      const dedis = TM.dediRecords
      const pageCount = this.paginator.pageCount
      const cpPage = this.cpPaginator.getPageByLogin(login) ?? 1
      this.displayToPlayer(login, { page, cpPage, dedis }, `${page}/${Math.max(1, pageCount)}`)
    })
    let cpPages = 1
    for (let i = 0; i < this.cpAmount; i++) {
      if (cpPages == 1 && i > this.sectorsPerPage * cpPages) {
        cpPages++
      } else if (i > (this.sectorsPerPage + 2) * cpPages) {
        cpPages++
      }
    }
    this.cpPaginator = new Paginator(this.openId + 10, this.windowWidth / 10, this.headerHeight - this.margin, cpPages, 1, true)
    this.cpPaginator.onPageChange((login: string, cpPage: number) => {
      const dedis = TM.dediRecords
      const pageCount = this.paginator.pageCount
      const page = this.paginator.getPageByLogin(login) ?? 1
      this.displayToPlayer(login, { page, cpPage, dedis }, `${page}/${Math.max(1, pageCount)}`)
    })
    TM.addListener('Controller.BeginMap', () => {
      this.cpAmount = TM.map.checkpointsAmount
      this.paginator.updatePageCount(Math.ceil(TM.dediRecords.length / this.entries))
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const dedis = TM.dediRecords
    const pageCount = this.paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, cpPage: 1, dedis }, `1/${Math.max(1, pageCount)}`)
  }

  protected constructContent(login: string, params: { page: number, cpPage: number, dedis: TMDedi[] }): string {
    const sectors: number[][] = params.dedis.map(a => [...a.checkpoints, a.time]).map(a => a
      .reduce((acc: number[], cur, i, arr) => i === 0 ? [cur] : [...acc, cur - arr[i - 1]], []))
    let sectorsDisplay = Math.min(this.cpAmount + 1, this.sectorsPerPage)
    let sectorIndex = 0
    if (params.cpPage > 1) {
      sectorIndex = this.sectorsPerPage + 1
      for (let i = 2; i < params.cpPage; i++) {
        sectorIndex += this.sectorsPerPage + 2
      }
      sectorsDisplay = Math.min(this.cpAmount - (sectorIndex - 2), this.sectorsPerPage + 2)
    }
    const n = (params.page - 1) * this.entries - 1
    const cpTypes = getCpTypes(sectors)
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n] === undefined) { return '' }
      return centeredText(CONFIG.static.format + TM.strip(params.dedis[i + n].nickName, false), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n] === undefined) { return '' }
      let ret = centeredText(CONFIG.static.format + params.dedis[i + n].login, w, h)
      if (login === params.dedis[i + n].login) {
        return `<format textcolor="${this.selfColour}"/>` + ret
      }
      return ret
    }
    const cell = (i: number, j: number, w: number, h: number): string => {
      const dedi = params.dedis?.[i + n]
      const playerSectors = sectors?.[i + n]
      if (dedi === undefined) {
        return ''
      }
      const type = cpTypes?.[i + n]?.[j + sectorIndex - 2]
      let colour = 'FFFF'
      if (type !== undefined) {
        colour = (this.colours as any)[type]
      }
      if (((j - 2 === this.sectorsPerPage && params.cpPage === 1) || (j - 3 === this.sectorsPerPage && params.cpPage !== 1))
        && playerSectors?.[(j - 2) + sectorIndex] !== undefined) {
        return centeredText(CONFIG.static.format + TM.Utils.getTimeString(dedi.time), w, h)
      }
      if (playerSectors?.[(j - 2) + sectorIndex] === undefined) {
        if (playerSectors?.[(j - 3) + sectorIndex] !== undefined) {
          return `<format textcolor="${colour}"/>
            ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(dedi.time), w, h)}`
        }
        return ''
      }
      return `<format textcolor="${colour}"/>
        ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(playerSectors[(j - 2) + sectorIndex]), w, h)}`
    }
    let grid: Grid
    let headers: ((i: number, j: number, w: number, h: number) => string)[]
    if (params.cpPage === 1) {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Login', w, h),
        ...new Array(sectorsDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j - 1).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.sectorsPerPage - sectorsDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth - this.margin, this.contentHeight - this.margin * 2, [2, 2, ...new Array(this.sectorsPerPage + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg })
    } else {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        ...new Array(sectorsDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + ((j - 1) + sectorIndex).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array((this.sectorsPerPage + 2) - sectorsDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth - this.margin, this.contentHeight - this.margin * 2, [2, ...new Array(this.sectorsPerPage + 3).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg })
    }
    const arr = [...headers]
    for (let i = 0; i < params.dedis.length; i++) {
      if (params.cpPage === 1) {
        arr.push(nickNameCell, loginCell, ...new Array(this.sectorsPerPage + 1).fill(cell))
      } else {
        arr.push(nickNameCell, ...new Array(this.sectorsPerPage + 3).fill(cell))
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