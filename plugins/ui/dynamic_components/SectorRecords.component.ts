import PopupWindow from '../PopupWindow.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { closeButton, CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, Paginator, GridCellFunction, GridCellObject } from '../UiUtils.js'
import { sectorRecords } from '../../SectorRecords.js'

export default class SectorRecords extends PopupWindow {

  private readonly entries = CONFIG.sectorRecords.entries
  private readonly grid: Grid
  private readonly paginator: Paginator
  private readonly diffColours = {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }

  constructor() {
    const iconurl = stringToObjectProperty(CONFIG.sectorRecords.icon, ICONS)
    super(IDS.sectorRecords, iconurl, CONFIG.sectorRecords.title, CONFIG.sectorRecords.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.sectorRecords.columnProportions, new Array(this.entries + 2).fill(1),
      { headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin, background: CONFIG.grid.bg })
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, Math.ceil(TM.map.checkpointsAmount / this.entries))
    this.paginator.onPageChange = (login: string, page: number) => {
      this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
    }
    TM.addCommand({
      aliases: ['secs', 'secrecs'],
      help: 'Displays the sector records on the current map.',
      callback: (info: MessageInfo) => {
        TM.openManialink(this.openId, info.login)
      },
      privilege: 0
    })
    sectorRecords.addListener('BestSector', () => this.reRender())
    sectorRecords.addListener('SectorsFetch', () => {
      this.paginator.setPageCount(Math.ceil(TM.map.checkpointsAmount / this.entries))
      this.reRender()
    })
    sectorRecords.addListener('PlayerSector', () => this.reRender())
    sectorRecords.addListener('DeleteBestSector', () => this.reRender())
    sectorRecords.addListener('DeletePlayerSector', () => this.reRender())
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.displayToPlayer(info.login, { page: 1 }, `1/${this.paginator.pageCount}`)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
    }
  }

  protected async constructContent(login: string, params: { page: number }): Promise<string> {
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Date ', w, h),
      (i, j, w, h) => centeredText(' Best ', w, h),
      (i, j, w, h) => centeredText(' Personal ', w, h)
    ]
    const sectors = sectorRecords.mapSectors
    const sectorIndex = this.entries * (params.page - 1)
    const personalSectors = sectorRecords.playerSectors

    const indexCell: GridCellFunction = (i, j, w, h) => {
      return centeredText((i + sectorIndex).toString(), w, h)
    }

    const nicknameCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(TM.safeString(TM.strip(sectors[i + sectorIndex - 1]?.nickname ?? '-', false)), w, h)
    }

    const loginCell: GridCellFunction = (i, j, w, h) => {
      const str = sectors[i + sectorIndex - 1]?.login ?? '-'
      if (str === login) { return `${centeredText(`$0F0${str}`, w, h)}` }
      return centeredText(str, w, h)
    }

    const dateCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(sectors[i + sectorIndex - 1]?.date?.toUTCString() ?? '-', w, h)
    }

    const bestSectorCell: GridCellFunction = (i, j, w, h) => {
      const sector = sectors?.[i + sectorIndex - 1]
      return centeredText(sector === null ? '--:--.-' : TM.Utils.getTimeString(sector.sector), w, h)
    }

    const personalSectorCell: GridCellFunction = (i, j, w, h) => {
      const sector = personalSectors.find(a => a.login === login)?.sectors[i + sectorIndex - 1]
      if (sector === undefined || sector === null) { return centeredText('--:--.-', w, h) }
      let differenceString = ''
      const bestSec = sectors?.[i + sectorIndex - 1]?.sector
      if (bestSec !== undefined) {
        const difference = bestSec - sector
        if (sectors?.[i + sectorIndex - 1]?.login === login) {
          differenceString = ''
        } else if (difference > 0) {
          differenceString = `(${this.diffColours.better}-${TM.Utils.getTimeString(difference)}$FFF)`
        } else if (difference === 0) {
          differenceString = `(${this.diffColours.equal}${TM.Utils.getTimeString(difference)}$FFF)`
        } else {
          differenceString = `(${this.diffColours.worse}+${TM.Utils.getTimeString(Math.abs(difference))}$FFF)`
        }
      }
      return centeredText(differenceString + ' ' + TM.Utils.getTimeString(sector), w, h)
    }

    const emptyCell: GridCellObject = {
      background: '',
      colspan: 3,
      callback: () => '',
    }

    const totalTimeHeaderCell: GridCellObject = {
      callback: (i, j, w, h) => centeredText(' Total Time ', w, h),
      background: CONFIG.grid.headerBg
    }

    const totalTime: GridCellFunction = (i, j, w, h) => {
      if (sectors.some(a => a === null)) {
        return centeredText('--:--.-', w, h)
      }
      const sum = sectors.map(a => a?.sector ?? 0).reduce((acc, cur) => acc += cur)
      return centeredText(TM.Utils.getTimeString(sum), w, h)
    }

    const pesonalTotalTime: GridCellFunction = (i, j, w, h) => {
      const secs = personalSectors.find(a => a.login === login)?.sectors
      if (secs === undefined || secs.some(a => a === null)) {
        return centeredText('--:--.-', w, h)
      }
      let differenceString = ''
      const sum = secs.map(a => a === null ? 0 : a).reduce((acc, cur) => acc += cur)
      if (!sectors.some(a => a === null)) {
        const bestSum = sectors.map(a => a?.sector ?? 0).reduce((acc, cur) => acc += cur)
        const difference = bestSum - sum
        if (difference > 0) {
          differenceString = `(${this.diffColours.better}-${TM.Utils.getTimeString(difference)}$FFF)`
        } else if (difference === 0) {
          differenceString = `(${this.diffColours.equal}${TM.Utils.getTimeString(difference)}$FFF)`
        } else {
          differenceString = `(${this.diffColours.worse}+${TM.Utils.getTimeString(Math.abs(difference))}$FFF)`
        }
      }
      return centeredText(differenceString + ' ' + TM.Utils.getTimeString(sum), w, h)
    }

    const rows = Math.min(this.entries, sectors.length - sectorIndex)
    const arr: (GridCellObject | GridCellFunction)[] = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nicknameCell, loginCell, dateCell, bestSectorCell, personalSectorCell)
    }
    arr.push(emptyCell, totalTimeHeaderCell, totalTime, pesonalTotalTime)
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }

}