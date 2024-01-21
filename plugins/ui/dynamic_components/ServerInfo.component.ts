/**
 * @author wiseraven & lythx
 * @since 1.1
 */

import { Grid, componentIds, GridCellFunction, GridCellObject, centeredText, closeButton, PopupWindow } from '../UI.js'
import config from './ServerInfo.config.js'
import { arch, cpus, loadavg, totalmem, freemem, platform } from 'node:os'
import { uptime, version, memoryUsage } from 'node:process'
import 'dotenv/config'

export default class ServerInfoWindow extends PopupWindow {

  private readonly grid: Grid
  private reRenderInterval?: NodeJS.Timeout

  constructor() {
    super(componentIds.serverInfoWindow, config.icon, config.title, config.navbar)
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info): void => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: config.command.privilege
    })
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array((config.serverCells.length + config.hostCells.length) / 2 + 1).fill(1), config.grid)
  }

  private async getServerInfo(): Promise<string[]> {
    // Dedicated server
    const dedicatedUptime: string = tm.utils.getVerboseTime((await tm.client.call(`GetNetworkStats`)).Uptime * 1000)
    const dedicatedVersion: string = tm.config.server.version
    const dedicatedBuild: string = tm.config.server.build
    // Configurable (or not) server variables
    const serverName: string = tm.utils.strip(tm.config.server.name, false)
    const serverLogin: string = tm.config.server.login
    const serverZone: string = (tm.config.server.zone).split(`|`, 2).join(`|`)
    const serverRights: string = tm.config.server.isUnited ? `United` : `Nations`
    const serverMaxPlayers: string = tm.config.server.currentMaxPlayers.toString()
    const serverMaxSpecs: string = tm.config.server.currentMaxSpectators.toString()
    const serverMaxRecs: string = tm.config.controller.localRecordsLimit.toString()
    const serverMapCount: string = tm.maps.count.toString()
    const serverVisitorsCount: string = tm.players.totalCount.toString()
    return [dedicatedUptime, dedicatedVersion, dedicatedBuild, serverName, serverLogin,
      serverZone, serverRights, serverMaxPlayers, serverMaxSpecs, serverMaxRecs,
      serverMapCount, serverVisitorsCount]
  }

  private getHostInfo(): string[] {
    // Host system information
    const osUptime: string = tm.utils.getVerboseTime(~~uptime() * 1000) // Seconds
    const osArch: string = arch()
    const osCPU: string = cpus()[0].model
    const osCPULoad: string = String(loadavg()[0] + `%`)
    const osRAM: string = String(~~((totalmem() - freemem()) / (1024 ** 2)) + ` MB`) // Bytes
    const osKernel: string = platform().toUpperCase()
    // Trakman information
    const trakmanVersion: string = tm.config.controller.version
    const trakmanUptime: string = tm.utils.getVerboseTime(~~uptime() * 1000) // Seconds
    // Node information
    const nodeVersion: string = version
    const nodeRAMUsage: string = String(~~(memoryUsage().heapTotal / (1024 ** 2)) + ` MB`)
    return [osUptime, osArch, osCPU, osCPULoad, osRAM, osKernel,
      trakmanVersion, trakmanUptime, nodeVersion, nodeRAMUsage,
      tm.db.dbVersion, tm.db.dbSize]
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    this.displayToPlayer(info.login)
    // If loop was already running no need to start it again
    if (this.reRenderInterval !== undefined) { return }
    this.reRenderInterval = setInterval((): void => { // Start the loop on window open
      this.reRender()
      if (this.getPlayersWithWindowOpen().length === 0) {
        clearInterval(this.reRenderInterval)
        this.reRenderInterval = undefined
      }
    }, 1000)
  }

  private reRender(): void {
    const logins: string[] = this.getPlayersWithWindowOpen()
    for (const login of logins) {
      this.displayToPlayer(login)
    }
  }

  protected async constructContent(): Promise<string> {
    const serverInfo: string[] = await this.getServerInfo()
    const hostInfo: string[] = await this.getHostInfo()
    const headers: GridCellObject[] = [
      {
        background: config.grid.headerBackground,
        colspan: 2,
        callback: (i, j, w, h): string => centeredText(config.serverCellHeader, w, h),
      },
      {
        background: config.grid.headerBackground,
        colspan: 2,
        callback: (i, j, w, h): string => centeredText(config.hostCellHeader, w, h),
      },
    ]
    const nameCell: GridCellObject = {
      background: config.nameColumnBackground,
      callback: (i, j, w, h): string => {
        const arr: string[] = j === 2 ? config.hostCells : config.serverCells
        return centeredText(arr[i - 1], w, h)
      }
    }
    const infoCell: GridCellFunction = (i, j, w, h): string => {
      const arr: string[] = j === 3 ? hostInfo : serverInfo
      return centeredText(arr[i - 1], w, h)
    }
    const rows: number = config.serverCells.length + config.hostCells.length
    const arr: (GridCellObject | GridCellFunction)[] = headers
    for (let i: number = 0; i < rows; i++) {
      arr.push(nameCell, infoCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}
