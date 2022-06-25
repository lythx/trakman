import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { headerIconTitleText, ICONS, IDS, Paginator, Grid, centeredText } from '../UiUtils.js'

const RECORDS_PER_PAGE = 15
const GRID_WIDTH = 8

export default class DediCps extends PopupWindow {

  readonly recordsPerPage: number = RECORDS_PER_PAGE
  readonly gridWidth = GRID_WIDTH
  readonly paginator: Paginator
  grid: Grid

  constructor() {
    super(IDS.DediCps)
    const dedis = TM.dediRecords
    const cpAmount = TM.challenge.checkpointsAmount
    this.grid = new Grid(this.contentWidth, this.contentHeight, [2, 2, ...new Array(Math.max(cpAmount, this.gridWidth)).fill(1)], new Array(this.recordsPerPage).fill(1))
    this.paginator = new Paginator(this.id, this.closeId, dedis.length / this.recordsPerPage)
    this.paginator.onPageChange((login: string, page: number) => {
      const dedis = TM.dediRecords
      const pageCount = this.paginator.pageCount
      this.displayToPlayer(login, { page, pageCount, dedis })
    })
    TM.addListener('Controller.BeginChallenge', (info: BeginChallengeInfo) => {
      this.grid = new Grid(this.contentWidth, this.contentHeight, [2, 2, ...new Array(Math.max(info.checkpointsAmount, this.gridWidth)).fill(1)], new Array(this.recordsPerPage).fill(1))
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const dedis = TM.dediRecords
    const pageCount = this.paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, pageCount, dedis })
  }

  protected constructHeader(login: string, params: { page: number, pageCount: number }): string {
    return headerIconTitleText('Dedimania Checkpoints', this.windowWidth, this.titleHeight, '', 2.5, 2.5, `${params.page}/${params.pageCount}`)
  }

  protected constructContent(login: string, params: { page: number, pageCount: number, dedis: TMDedi[] }): string {
    const n = (params.page - 1) * this.recordsPerPage
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n] === undefined) { return '' }
      return centeredText(TM.strip(params.dedis[i + n].nickName, false), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n] === undefined) { return '' }
      return centeredText(params.dedis[i + n].login, w, h)
    }
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (params.dedis?.[i + n]?.checkpoints?.[j - 2] === undefined) {
        return ''
      }
      return centeredText(TM.Utils.getTimeString(params.dedis[i + n].checkpoints[j - 2]), w, h)
    }
    let arr = []
    for (let i = 0; i < params.dedis.length; i++) {
      arr.push(nickNameCell, loginCell, ...new Array(this.grid.columns - 2).fill(cell))
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number, pageCount: number }): string {
    return this.paginator.constructXml(params.page)
  }
} 