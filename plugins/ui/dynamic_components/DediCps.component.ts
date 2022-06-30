import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { headerIconTitleText, ICONS, IDS, Paginator, Grid, centeredText, CONFIG, closeButton, getCpTypes, stringToObjectProperty } from '../UiUtils.js'

export default class DediCps extends PopupWindow {

  readonly cpsPerPage: number = CONFIG.dediCps.cpsPerPage
  readonly entries: number = CONFIG.dediCps.entries
  readonly paginator: Paginator
  readonly cpPaginator: Paginator
  readonly selfColour: string = CONFIG.dediCps.selfColour
  readonly colours = {
    best: '0F0F',
    worst: 'F00F',
    equal: 'FF0F'
  }
  readonly paginatorOffset: number = CONFIG.dediCps.paginatorOffset
  cpAmount: number

  constructor() {
    super(IDS.dediCps, stringToObjectProperty(CONFIG.dediCps.icon, ICONS), CONFIG.dediCps.title, ['dediSectors', 'localCps', 'localSectors', 'liveCps', 'liveSectors'])
    const dedis: TMDedi[] = TM.dediRecords
    this.cpAmount = TM.map.checkpointsAmount - 1
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(dedis.length / this.entries))
    this.paginator.onPageChange((login: string, page: number): void => {
      const dedis: TMDedi[] = TM.dediRecords
      const pageCount: number = this.paginator.pageCount
      const cpPage: number = this.cpPaginator.getPageByLogin(login) ?? 1
      this.displayToPlayer(login, { page, cpPage, dedis }, `${page}/${Math.max(1, pageCount)}`)
    })
    let cpPages: number = 1
    for (let i: number = 0; i < this.cpAmount; i++) {
      if (cpPages == 1 && i > this.cpsPerPage * cpPages) {
        cpPages++
      } else if (i > (this.cpsPerPage + 2) * cpPages) {
        cpPages++
      }
    }
    this.cpPaginator = new Paginator(this.openId + 10, this.windowWidth / 10, this.footerHeight, cpPages, 1, true)
    this.cpPaginator.onPageChange((login: string, cpPage: number): void => {
      const dedis: TMDedi[] = TM.dediRecords
      const pageCount: number = this.paginator.pageCount
      const page: number = this.paginator.getPageByLogin(login) ?? 1
      this.displayToPlayer(login, { page, cpPage, dedis }, `${page}/${Math.max(1, pageCount)}`)
    })
    TM.addListener('Controller.BeginMap', (): void => {
      this.cpAmount = TM.map.checkpointsAmount
      this.paginator.updatePageCount(Math.ceil(TM.dediRecords.length / this.entries))
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const dedis: TMDedi[] = TM.dediRecords
    const pageCount: number = this.paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, cpPage: 1, dedis }, `1/${Math.max(1, pageCount)}`)
  }

  protected constructContent(login: string, params: { page: number, cpPage: number, dedis: TMDedi[] }): string {
    let cpsDisplay: number = Math.min(this.cpAmount, this.cpsPerPage)
    let cpIndex: number = 0
    if (params.cpPage > 1) {
      cpIndex = this.cpsPerPage + 1
      for (let i: number = 2; i < params.cpPage; i++) {
        cpIndex += this.cpsPerPage + 2
      }
      cpsDisplay = Math.min(this.cpAmount - (cpIndex - 1), this.cpsPerPage + 2)
    }
    const n: number = (params.page - 1) * this.entries - 1
    const cpTypes = getCpTypes(params.dedis.map(a => a.checkpoints))
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n] === undefined) { return '' }
      return centeredText(CONFIG.static.format + TM.strip(params.dedis[i + n].nickName, false), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n] === undefined) { return '' }
      let ret: string = centeredText(CONFIG.static.format + params.dedis[i + n].login, w, h)
      if (login === params.dedis[i + n].login) {
        return `<format textcolor="${this.selfColour}"/>` + ret
      }
      return ret
    }
    const cell = (i: number, j: number, w: number, h: number): string => {
      const dedi: TMDedi = params.dedis?.[i + n]
      if (dedi === undefined) {
        return ''
      }
      const type = cpTypes?.[i + n]?.[j + cpIndex - 2]
      let colour: string = 'FFFF'
      if (type !== undefined) {
        colour = (this.colours as any)[type]
      }
      if (((j - 2 === this.cpsPerPage && params.cpPage === 1) || (j - 3 === this.cpsPerPage && params.cpPage !== 1))
        && dedi?.checkpoints?.[(j - 2) + cpIndex] !== undefined) {
        return centeredText(CONFIG.static.format + CONFIG.static.format + TM.Utils.getTimeString(dedi.time), w, h)
      }
      if (dedi?.checkpoints?.[(j - 2) + cpIndex] === undefined) {
        if (dedi?.checkpoints?.[(j - 3) + cpIndex] !== undefined) {
          return `<format textcolor="${colour}"/>
            ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(dedi.time), w, h)}`
        }
        return ''
      }
      return `<format textcolor="${colour}"/>
        ${centeredText(CONFIG.static.format + TM.Utils.getTimeString(dedi.checkpoints[(j - 2) + cpIndex]), w, h)}`
    }
    let grid: Grid
    let headers: ((i: number, j: number, w: number, h: number) => string)[]
    if (params.cpPage === 1) {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Login', w, h),
        ...new Array(cpsDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + (j - 1).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array(this.cpsPerPage - cpsDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [2, 2, ...new Array(this.cpsPerPage + 1).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg })
    } else {
      headers = [
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Nickname ', w, h),
        ...new Array(cpsDisplay).fill((i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + ((j - 1) + cpIndex).toString(), w, h)),
        (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Finish', w, h),
        ...new Array((this.cpsPerPage + 2) - cpsDisplay).fill((i: number, j: number, w: number, h: number): string => '')
      ]
      grid = new Grid(this.contentWidth, this.contentHeight, [2, ...new Array(this.cpsPerPage + 3).fill(1)], new Array(this.entries + 1).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg })
    }
    const arr = [...headers]
    for (let i: number = 0; i < params.dedis.length; i++) {
      if (params.cpPage === 1) {
        arr.push(nickNameCell, loginCell, ...new Array(this.cpsPerPage + 1).fill(cell))
      } else {
        arr.push(nickNameCell, ...new Array(this.cpsPerPage + 3).fill(cell))
      }
    }
    return grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, cpPage: number }): string {
    return `${closeButton(this.closeId, this.windowWidth, this.footerHeight)}
    ${this.paginator.constructXml(params.page)}
    <frame posn="${this.windowWidth - this.paginatorOffset} 0 3">
      ${this.cpPaginator.constructXml(params.cpPage)}
    </frame>`
  }
} 