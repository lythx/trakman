/**
 * @author lythx
 * @since 0.3
 */

import { closeButton, componentIds, Grid, centeredText, Paginator, GridCellFunction, GridCellObject, PopupWindow } from '../../ui//UI.js'
import { sectorRecords } from '../../sector_records/SectorRecords.js'
import config from './SectorRecords.config.js'

class SectorRecords extends PopupWindow {

  private readonly grid: Grid
  private readonly paginator: Paginator

  constructor() {
    super(componentIds.sectorRecords, config.icon, config.title, (tm.getGameMode() === 'Stunts' ? config.stuntsNavbar : config.navbar))
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries + 2).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight,
      Math.ceil(tm.maps.current.checkpointsAmount / config.entries))
    this.paginator.onPageChange = (login: string, page: number) => {
      this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
    }
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info: tm.MessageInfo) => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: config.command.privilege
    })
    sectorRecords.addListener('NicknameUpdated', () => this.reRender())
    sectorRecords.addListener('BestSector', () => this.reRender())
    sectorRecords.addListener('SectorsFetch', () => {
      this.paginator.setPageCount(Math.ceil(tm.maps.current.checkpointsAmount / config.entries))
      this.reRender()
    })
    sectorRecords.addListener('PlayerSector', (info) => this.reRenderToPlayer(info.login))
    sectorRecords.addListener('DeleteBestSector', () => this.reRender())
    sectorRecords.addListener('DeletePlayerSector', (info) => this.reRenderToPlayer(info.login))
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    this.displayToPlayer(info.login, { page: 1 }, `1/${this.paginator.pageCount} `)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
    }
  }

  private reRenderToPlayer(login: string): void {
    if (!this.getPlayersWithWindowOpen().includes(login)) { return }
    const page = this.paginator.getPageByLogin(login)
    this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
  }

  protected constructContent(login: string, params: { page: number }): string {
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Date ', w, h),
      (i, j, w, h) => centeredText(' Best ', w, h),
      (i, j, w, h) => centeredText(' Personal ', w, h)
    ]
    const sectors = sectorRecords.mapSectors
    const sectorIndex = config.entries * (params.page - 1)
    const personalSectors = sectorRecords.playerSectors

    const indexCell: GridCellFunction = (i, j, w, h) => {
      return centeredText((i + sectorIndex).toString(), w, h)
    }

    const nicknameCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(tm.utils.safeString(tm.utils.strip(sectors[i + sectorIndex - 1]?.nickname ?? '-', false)), w, h)
    }

    const loginCell: GridCellFunction = (i, j, w, h) => {
      const str = sectors[i + sectorIndex - 1]?.login ?? '-'
      if (str === login) { return `${centeredText(`$${config.selfColour + str}`, w, h)}` }
      return centeredText(str, w, h)
    }

    const dateCell: GridCellFunction = (i, j, w, h) => {
      const sector = sectors[i + sectorIndex - 1]
      return centeredText((sector === undefined || sector === null) ? '' :
        tm.utils.formatDate(sector.date, true), w, h)
    }

    const bestSectorCell: GridCellFunction = (i, j, w, h) => {
      const sector = sectors?.[i + sectorIndex - 1]
      const noTimeText = tm.getGameMode() === 'Stunts' ? config.stuntsNoTimeText : config.noTimeText
      return centeredText(sector === null ? noTimeText : tm.utils.getTimeString(sector.sector), w, h)
    }

    const personalSectorCell: GridCellFunction = (i, j, w, h) => {
      const sector = personalSectors.find(a => a.login === login)?.sectors[i + sectorIndex - 1]
      const isStunts = tm.getGameMode() === 'Stunts'
      const noTimeText = isStunts ? config.stuntsNoTimeText : config.noTimeText
      if (sector === undefined || sector === null) { return centeredText(noTimeText, w, h) }
      let differenceString = ''
      const bestSec = sectors?.[i + sectorIndex - 1]?.sector
      let betterSign = '-'
      let worseSign = '+'
      if(isStunts) {
        betterSign = '+'
        worseSign = '-'
      }
      if (bestSec !== undefined) {
        const difference = bestSec - sector
        if (sectors?.[i + sectorIndex - 1]?.login === login) {
          differenceString = ''
        } else if (difference > 0) {
          differenceString = `($${config.colours.better}${betterSign}${tm.utils.getTimeString(difference)}$FFF)`
        } else if (difference === 0) {
          differenceString = `($${config.colours.equal}${tm.utils.getTimeString(difference)}$FFF)`
        } else {
          differenceString = `($${config.colours.worse}${worseSign}${tm.utils.getTimeString(Math.abs(difference))}$FFF)`
        }
      }
      return centeredText(differenceString + ' ' + tm.utils.getTimeString(sector), w, h)
    }

    const emptyCell: GridCellObject = {
      background: '',
      colspan: 3,
      callback: () => '',
    }

    const totalTimeHeaderCell: GridCellObject = {
      callback: (i, j, w, h) => centeredText(` Total ${tm.getGameMode() === 'Stunts' ? 'Score' : 'Time'} `, w, h),
      background: config.grid.headerBackground
    }

    const totalTime: GridCellFunction = (i, j, w, h) => {
      if (sectors.some(a => a === null)) {
        const noTimeText = tm.getGameMode() === 'Stunts' ? config.stuntsNoTimeText : config.noTimeText
        return centeredText(noTimeText, w, h)
      }
      const sum = sectors.map(a => a?.sector ?? 0).reduce((acc, cur) => acc += cur)
      return centeredText(tm.utils.getTimeString(sum), w, h)
    }

    const pesonalTotalTime: GridCellFunction = (i, j, w, h) => {
      const secs = personalSectors.find(a => a.login === login)?.sectors
      const isStunts = tm.getGameMode() === 'Stunts'
      const noTimeText = isStunts ? config.stuntsNoTimeText : config.noTimeText
      if (secs === undefined || secs.some(a => a === null)) {
        return centeredText(noTimeText, w, h)
      }
      let betterSign = '-'
      let worseSign = '+'
      if(isStunts) {
        betterSign = '+'
        worseSign = '-'
      }
      let differenceString = ''
      const sum = secs.map(a => a === null ? 0 : a).reduce((acc, cur) => acc += cur)
      if (!sectors.some(a => a === null)) {
        const bestSum = sectors.map(a => a?.sector ?? 0).reduce((acc, cur) => acc += cur)
        const difference = bestSum - sum
        if (difference > 0) {
          differenceString = `($${config.colours.better}${betterSign}${tm.utils.getTimeString(difference)}$FFF)`
        } else if (difference === 0) {
          differenceString = `($${config.colours.equal}${tm.utils.getTimeString(difference)}$FFF)`
        } else {
          differenceString = `($${config.colours.worse}${worseSign}${tm.utils.getTimeString(Math.abs(difference))}$FFF)`
        }
      }
      return centeredText(differenceString + ' ' + tm.utils.getTimeString(sum), w, h)
    }

    const rows = Math.min(config.entries, sectors.length - sectorIndex)
    const arr: (GridCellObject | GridCellFunction)[] = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nicknameCell, loginCell, dateCell, bestSectorCell, personalSectorCell)
    }
    arr.push(emptyCell, totalTimeHeaderCell, totalTime, pesonalTotalTime)
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(params.page)
  }

}

tm.addListener('Startup', () => {
  new SectorRecords()
})
