/**
 * @author wiseraven & lythx
 * @since 1.1
 */

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
        const dedicatedUptime: string = tm.utils.msToTime((await tm.client.call(`GetNetworkStats`)).Uptime * 1000)
        const dedicatedVersion: string = tm.config.server.version
        const dedicatedBuild: string = tm.config.server.build
        // Configurable (or not) server variables
        const serverName: string = tm.config.server.name
        const serverLogin: string = tm.config.server.login
        const serverZone: string = (tm.config.server.zone).split(`|`, 2).join(`|`)
        const serverRights: string = tm.config.server.isUnited ? `United` : `Nations`
        const serverMaxPlayers: string = tm.config.server.currentMaxPlayers.toString()
        const serverMaxSpecs: string = tm.config.server.currentMaxSpectators.toString()
        const serverMaxRecs: string = tm.config.controller.localRecordsLimit.toString()
        const serverMapCount: string = tm.maps.count.toString()
        const serverVisitorsCount: string = tm.players.count.toString()
        return [dedicatedUptime, dedicatedVersion, dedicatedBuild, serverName, serverLogin,
            serverZone, serverRights, serverMaxPlayers, serverMaxSpecs, serverMaxRecs,
            serverMapCount, serverVisitorsCount]
    }

    private async getHostInfo(): Promise<string[]> {
        // Host system information
        const osUptime: string = tm.utils.msToTime(~~os.uptime() * 1000) // Seconds
        const osArch: string = os.arch()
        const osCPU: string = os.cpus()[0].model
        const osCPULoad: string = String(os.loadavg()[0] + `%`)
        const osRAM: string = String(~~((os.totalmem() - os.freemem()) / (1024 ** 2)) + ` MB`) // Bytes
        const osKernel: string = os.platform().toUpperCase()
        // Trakman information
        const trakmanVersion: string = tm.config.controller.version
        const trakmanUptime: string = tm.utils.msToTime(~~process.uptime() * 1000) // Seconds
        // Node information
        const nodeVersion: string = process.version
        const nodeRAMUsage: string = String(~~(process.memoryUsage().heapTotal / (1024 ** 2)) + ` MB`)
        // Postgres information
        const postgresVersion: string = String(`v` + (await tm.db.query(`select version();`) as any)[0].version).split(` `)[1]
        const postgresDBSize: string = String((await tm.db.query(`select pg_size_pretty(pg_database_size('${process.env.DB_NAME}'));`) as any)[0].pg_size_pretty)
        return [osUptime, osArch, osCPU, osCPULoad, osRAM, osKernel,
            trakmanVersion, trakmanUptime, nodeVersion, nodeRAMUsage,
            postgresVersion, postgresDBSize]
    }

    protected async constructContent(): Promise<string> {
        const serverInfo: string[] = await this.getServerInfo()
        const hostInfo: string[] = await this.getHostInfo()
        const headers: GridCellObject[] = [
            {
                background: config.grid.headerBackground,
                colspan: 2,
                callback: (i, j, w, h): string => centeredText(` Server Information `, w, h),
            },
            {
                background: config.grid.headerBackground,
                colspan: 2,
                callback: (i, j, w, h): string => centeredText(` Host Information `, w, h),
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

    protected constructFooter(): string | Promise<string> {
        return closeButton(this.closeId, this.windowWidth, this.footerHeight)
    }
}
