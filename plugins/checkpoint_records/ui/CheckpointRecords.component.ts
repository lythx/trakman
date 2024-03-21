/**
 * @author lythx
 * @since 0.3
 */

import { closeButton, componentIds, Grid, centeredText, Paginator, GridCellFunction, GridCellObject, PopupWindow } from '../../ui/UI.js'
import { checkpointRecords } from '../../checkpoint_records/CheckpointRecords.js'
import config from './CheckpointRecords.config.js'

class CheckpointRecords extends PopupWindow {

  private readonly grid: Grid
  private readonly paginator: Paginator
  private readonly diffColours = {
    worse: tm.utils.palette.red,
    better: tm.utils.palette.purple,
    equal: tm.utils.palette.yellow
  }

  constructor() {
    super(componentIds.checkpointRecords, config.icon, config.title, (tm.getGameMode() === 'Stunts' ? config.stuntsNavbar : config.navbar))
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, new Array(config.entries + 1).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, Math.ceil(tm.maps.current.checkpointsAmount / config.entries))
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
    checkpointRecords.addListener('BestCheckpoint', () => this.reRender())
    checkpointRecords.addListener('CheckpointsFetch', () => {
      this.paginator.setPageCount(Math.ceil(tm.maps.current.checkpointsAmount / config.entries))
      this.reRender()
    })
    checkpointRecords.addListener('PlayerCheckpoint', (info) => this.reRenderToPlayer(info.login))
    checkpointRecords.addListener('DeleteBestCheckpoint', () => this.reRender())
    checkpointRecords.addListener('DeletePlayerCheckpoint', (info) => this.reRenderToPlayer(info.login))
    checkpointRecords.addListener('NicknameUpdated', () => this.reRender())
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

  protected async constructContent(login: string, params: { page: number }): Promise<string> {
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Date ', w, h),
      (i, j, w, h) => centeredText(' Best ', w, h),
      (i, j, w, h) => centeredText(' Personal ', w, h)
    ]
    const cps = checkpointRecords.mapCheckpoints
    const cpIndex = config.entries * (params.page - 1)
    const personalCps = checkpointRecords.playerCheckpoints

    const indexCell: GridCellFunction = (i, j, w, h) => {
      return centeredText((i + cpIndex).toString(), w, h)
    }

    const nicknameCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(tm.utils.safeString(tm.utils.strip(cps[i + cpIndex - 1]?.nickname ?? '-', false)), w, h)
    }

    const loginCell: GridCellFunction = (i, j, w, h) => {
      const str = cps[i + cpIndex - 1]?.login ?? '-'
      if (str === login) { return `${centeredText(`$${config.selfColour + str}`, w, h)}` }
      return centeredText(str, w, h)
    }

    const dateCell: GridCellFunction = (i, j, w, h) => {
      const cp = cps[i + cpIndex - 1]
      return centeredText((cp === undefined || cp === null) ? '' :
        tm.utils.formatDate(cp.date, true), w, h)
    }

    const bestSectorCell: GridCellFunction = (i, j, w, h) => {
      const cp = cps?.[i + cpIndex - 1]
      const noTimeText = tm.getGameMode() === 'Stunts' ? config.stuntsNoTimeText : config.noTimeText
      return centeredText(cp === null ? noTimeText : tm.utils.getTimeString(cp.checkpoint), w, h)
    }

    const personalSectorCell: GridCellFunction = (i, j, w, h) => {
      const cp = personalCps.find(a => a.login === login)?.checkpoints[i + cpIndex - 1]
      const noTimeText = tm.getGameMode() === 'Stunts' ? config.stuntsNoTimeText : config.noTimeText
      if (cp === undefined || cp === null) { return centeredText(noTimeText, w, h) }
      let differenceString = ''
      const bestSec = cps?.[i + cpIndex - 1]?.checkpoint
      let betterSign = '-'
      let worseSign = '+'
      if (tm.getGameMode() === 'Stunts') {
        betterSign = '+'
        worseSign = '-'
      }
      if (bestSec !== undefined) {
        const difference = bestSec - cp
        if (cps?.[i + cpIndex - 1]?.login === login) {
          differenceString = ''
        } else if (difference > 0) {
          differenceString = `($${this.diffColours.better}${betterSign}${tm.utils.getTimeString(difference)}$FFF)`
        } else if (difference === 0) {
          differenceString = `($${this.diffColours.equal + tm.utils.getTimeString(difference)}$FFF)`
        } else {
          differenceString = `($${this.diffColours.worse}${worseSign}${tm.utils.getTimeString(Math.abs(difference))}$FFF)`
        }
      }
      return centeredText(differenceString + ' ' + tm.utils.getTimeString(cp), w, h)
    }

    const rows = Math.min(config.entries, cps.length - cpIndex)
    const arr: (GridCellObject | GridCellFunction)[] = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nicknameCell, loginCell, dateCell, bestSectorCell, personalSectorCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }

}

tm.addListener('Startup', () => {
  new CheckpointRecords()
})