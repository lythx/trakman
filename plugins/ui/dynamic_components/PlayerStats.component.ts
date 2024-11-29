/**
 * @author wiseraven
 * @since 1.3.3
 */

import { Grid, componentIds, type GridCellFunction, type GridCellObject, centeredText, closeButton, PopupWindow } from '../UI.js'
import { titles } from '../../../config/Titles.js'
import { stats } from '../../stats/Stats.js'
import config from './PlayerStats.config.js'

export default class PlayerStatsWindow extends PopupWindow {

  private readonly grid: Grid

  constructor() {
    super(componentIds.playerStats, config.icon, config.title, config.navbar, config.width)
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      params: [{ name: 'login', optional: true }],
      callback: async (info: tm.MessageInfo, login?: string): Promise<void> => {
        const player: tm.OfflinePlayer | undefined = tm.players.get(login ?? info.login) ?? await tm.players.fetch(login ?? info.login)
        if (player === undefined) {
          tm.sendMessage(config.command.error, info.login)
          return
        }
        void this.openWithOption(info.login, player)
      },
      privilege: config.command.privilege
    })
    tm.addListener([`PlayerDataUpdated`, `PlayerInfoChanged`], (): void => {
      this.reRender()
    })
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.cells.length + 1).fill(1), config.grid)
  }

  async openWithOption(login: string, player: tm.OfflinePlayer): Promise<void> {
    this.displayToPlayer(login, { player })
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    this.displayToPlayer(info.login, { player: info })
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      this.displayToPlayer(player.login, player.params)
    }
  }

  protected constructContent(login: string, params?: { player: tm.OfflinePlayer }): string {
    if (params === undefined) { return '' }
    const data: string[] = [
      params.player.login,
      tm.utils.safeString(tm.utils.strip(params.player.nickname, false)),
      `${params.player.country} / ${params.player.countryCode}`,
      titles.privileges[params.player.privilege as keyof typeof titles.privileges],
      (stats.averages.list.findIndex(a => a.login === params.player.login) + 1).toString(),
      params.player.average.toString(),
      tm.utils.getVerboseTime(params.player.timePlayed),
      stats.records.list.find(a => a.login === params.player.login)?.amount.toString() ?? `0`,
      stats.votes.list.find(a => a.login === params.player.login)?.count.toString() ?? `0`,
      stats.sums.list.find(a => a.login === params.player.login)?.sums.slice(0, 4)
      // TODO: Find out how does the index go out of bounds here
        .map((a, i) => `$${config.sumsColours[i]}${a}$FFF`).join(' / ') ?? `None`,
      params.player.visits.toString(),
      stats.donations.list.find(a => a.login === params.player.login)?.amount.toString() ?? `0`,
      params.player.wins.toString(),
      params.player.isUnited ? `United` : `Nations`,
      tm.utils.formatDate(params.player.lastOnline ?? new Date(), true)
    ]
    const header: GridCellObject[] = [
      {
        background: config.grid.headerBackground,
        colspan: 2,
        callback: (i, j, w, h): string => centeredText(config.cellHeader, w, h),
      }
    ]
    const nameCell: GridCellObject = {
      background: config.nameColumnBackground,
      callback: (i, j, w, h): string => {
        const arr: string[] = config.cells
        return centeredText(arr[i - 1], w, h)
      }
    }
    const infoCell: GridCellFunction = (i, j, w, h): string => {
      return centeredText(data[i - 1], w, h)
    }
    const rows: number = config.cells.length
    const arr: (GridCellObject | GridCellFunction)[] = header
    for (let i = 0; i < rows; i++) {
      arr.push(nameCell, infoCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}
