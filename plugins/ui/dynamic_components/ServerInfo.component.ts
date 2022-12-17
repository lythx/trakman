import { Grid, componentIds, GridCellFunction, GridCellObject, centeredText, closeButton, PopupWindow } from '../UI.js'
import config from './ServerInfo.config.js'
import * as os from 'node:os'
import * as process from 'node:process'
import 'dotenv/config'

export default class ServerInfoWindow extends PopupWindow {

  private readonly grid: Grid

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
    const dedicatedUptime = `` // TODO
    const dedicatedVersion = tm.config.server.version
    const dedicatedBuild = tm.config.server.build
    // Configurable (or not) server variables
    const serverName = tm.config.server.name
    const serverLogin = tm.config.server.login
    const serverZone = tm.config.server.zone
    const serverRights = tm.config.server.isUnited ? `United` : `Nations`
    const serverMaxPlayers = tm.config.server.currentMaxPlayers.toString()
    const serverMaxSpecs = tm.config.server.currentMaxSpectators.toString()
    const serverMaxRecs = tm.config.controller.localRecordsLimit.toString()
    const serverMapCount = tm.maps.count.toString()
    const serverVisitorsCount = tm.players.count.toString()
    return [dedicatedUptime, dedicatedVersion, dedicatedBuild, serverName, serverLogin,
      serverZone, serverRights, serverMaxPlayers, serverMaxSpecs, serverMaxRecs,
      serverMapCount, serverVisitorsCount]
  }

  private async getHostInfo(): Promise<string[]> {
    // Host system information
    const osUptime = os.uptime().toString() // Seconds
    const osArch = os.arch()
    const osCPU = os.cpus() // TODO
    const osCPULoad = os.cpus() // TODO
    const osRAM = String(os.totalmem() - os.freemem()) // Bytes
    const osKernel = os.platform().toUpperCase()
    // Trakman information
    const trakmanVersion = tm.config.controller.version
    const trakmanUptime = ~~process.uptime() // Seconds
    // Node information
    const nodeVersion = process.version
    const nodeRAMUsage = process.memoryUsage()
    // Postgres information
    const postgresVersion = await tm.db.query(`select version();`)
    const postgresDBSize = await tm.db.query(`select pg_size_pretty(pg_database_size(
     '${process.env.DB_NAME}'));`)
    return [osUptime, osArch, osCPU, osCPULoad,
      osRAM, osKernel, trakmanVersion, trakmanUptime, nodeVersion, nodeRAMUsage,
      postgresVersion, postgresDBSize] as string[]
  }

  protected async constructContent(): Promise<string> {
    const serverInfo = await this.getServerInfo()
    const hostInfo = await this.getHostInfo()
    const headers: GridCellObject[] = [
      {
        background: config.grid.headerBackground,
        colspan: 2,
        callback: (i, j, w, h) => centeredText(` Server Information `, w, h),
      },
      {
        background: config.grid.headerBackground,
        colspan: 2,
        callback: (i, j, w, h) => centeredText(` Host Information `, w, h),
      },
    ]
    const nameCell: GridCellObject = {
      background: config.nameColumnBackground,
      callback: (i, j, w, h): string => {
        const arr = j === 2 ? config.hostCells : config.serverCells
        return centeredText(arr[i - 1], w, h)
      }
    }
    const infoCell: GridCellFunction = (i, j, w, h): string => {
      const arr = j === 3 ? hostInfo : serverInfo
      return centeredText(arr[i - 1], w, h)
    }
    const rows = config.serverCells.length + config.hostCells.length
    const arr: (GridCellObject | GridCellFunction)[] = headers
    for (let i = 0; i < rows; i++) {
      arr.push(nameCell, infoCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(): string | Promise<string> {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}