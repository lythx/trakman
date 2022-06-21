import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { headerIconTitleText, ICONS, IDS, Paginator, Grid, centeredText, CONFIG } from '../UiUtils.js'

const RECORDS_PER_PAGE = 15
const GRID_WIDTH = 8
const format = CONFIG.widgetStyleRace.formattingCodes

export default class LocalCps extends PopupWindow {

  readonly recordsPerPage: number = RECORDS_PER_PAGE
  readonly minGridWidth = GRID_WIDTH
  readonly paginator: Paginator
  grid: Grid

  constructor() {
    super(IDS.LocalCps)
    const locals = TM.localRecords
    const cpAmount = TM.challenge.checkpointsAmount
    this.grid = new Grid(this.contentWidth, this.contentHeight, [2, 2, 2, ...new Array(Math.max(cpAmount, this.minGridWidth)).fill(1)], new Array(this.recordsPerPage).fill(1))
    this.paginator = new Paginator(this.id, this.closeId, locals.length / this.recordsPerPage)
    this.paginator.onPageChange((login: string, page: number) => {
      const locals = TM.localRecords
      const pageCount = this.paginator.pageCount
      this.displayToPlayer(login, { page, pageCount, locals })
    })
    TM.addListener('Controller.BeginChallenge', (info: BeginChallengeInfo) => {
      this.grid = new Grid(this.contentWidth, this.contentHeight, [2, 2, 2, ...new Array(Math.max(info.checkpointsAmount, this.minGridWidth)).fill(1)], new Array(this.recordsPerPage).fill(1))
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const locals = TM.localRecords
    const pageCount = this.paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, pageCount, locals })
  }

  protected constructHeader(login: string, params: { page: number, pageCount: number }): string {
    return headerIconTitleText('Dedimania Checkpoints', this.windowWidth, this.titleHeight, ICONS.barGraph, 2.5, 2.5, `${params.page}/${params.pageCount}`)
  }

  protected constructContent(login: string, params: { page: number, pageCount: number, locals: LocalRecord[] }): string {
    const n = ((params.page - 1) * this.recordsPerPage) - 1
    const headers = [
      (i: number, j: number, w: number, h: number): string => centeredText('Nickname ', w, h),
      (i: number, j: number, w: number, h: number): string => centeredText('Login', w, h),
      (i: number, j: number, w: number, h: number): string => centeredText('Date', w, h),
    ]
    for (let index = 1; index <= this.grid.columns - 3; index++) {
      if (index < TM.challenge.checkpointsAmount) {
        headers.push((i: number, j: number, w: number, h: number): string => centeredText((index).toString(), w, h))
      }
      else if (index === TM.challenge.checkpointsAmount) {
        headers.push((i: number, j: number, w: number, h: number): string => centeredText(('Finish').toString(), w, h))
      }
      else {
        headers.push((i: number, j: number, w: number, h: number): string => centeredText(('').toString(), w, h))
      }
    }
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      if (params.locals?.[i + n] === undefined) { return '' }
      return centeredText(format + TM.strip(params.locals[i + n].nickName, false), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      if (params.locals?.[i + n] === undefined) { return '' }
      return centeredText(format + params.locals[i + n].login, w, h)
    }
    const dateCell = (i: number, j: number, w: number, h: number): string => {
      if (params.locals?.[i + n] === undefined) { return '' }
      const date = params.locals[i + n].date
      return centeredText(`${format}${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`, w, h)
    }
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (params.locals?.[i + n] === undefined) {
        return ''
      }
      if (j === 3 + TM.challenge.checkpointsAmount) {
        return centeredText(format + TM.Utils.getTimeString(params.locals[i + n].score), w, h)
      }
      if (params.locals[i + n]?.checkpoints?.[j - 3] === undefined) {
        return ''
      }
      return centeredText(format + TM.Utils.getTimeString(params.locals[i + n].checkpoints[j - 3]), w, h)
    }
    let arr = [...headers]
    for (let i = 0; i < params.locals.length; i++) {
      arr.push(nickNameCell, loginCell, dateCell, ...new Array(this.grid.columns - 3).fill(cell))
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, pageCount: number }): string {
    return this.paginator.constructXml(params.page)
  }
} 