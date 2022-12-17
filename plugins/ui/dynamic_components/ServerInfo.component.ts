import { Grid, componentIds, GridCellFunction, GridCellObject, centeredText, closeButton, PopupWindow } from '../UI.js'
import config from './ServerInfo.config.js'
import * as os from 'node:os'
import * as process from 'node:process'

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
        this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, new Array(config.cells.length / 2).fill(1), config.grid)
    }

    private async getInfo() {
        // Dedicated server
        const dedicatedUptime = `` // TODO
        const dedicatedVersion = tm.config.server.version
        const dedicatedBuild = tm.config.server.build
        // Configurable (or not) server variables
        const serverName = tm.config.server.name
        const serverLogin = tm.config.server.login
        const serverZone = tm.config.server.zone
        const serverRights = tm.config.server.isUnited ? `United` : `Nations`
        const serverMaxPlayers = tm.config.server.currentMaxPlayers
        const serverMaxSpecs = tm.config.server.currentMaxSpectators
        const serverMaxRecs = tm.config.controller.localRecordsLimit
        const serverMapCount = tm.maps.count
        const serverVisitorsCount = tm.players.count
        // Host system information
        const osUptime = os.uptime() // Seconds
        const osArch = os.arch()
        const osCPU = os.cpus() // TODO
        const osCPULoad = os.cpus() // TODO
        const osRAM = os.totalmem() - os.freemem() // Bytes
        const osKernel = os.platform().toUpperCase()
        // Trakman information
        const trakmanVersion = tm.config.controller.version
        const trakmanUptime = ~~process.uptime() // Seconds
        // Node information
        const nodeVersion = process.version
        const nodeRAMUsage = process.memoryUsage()
        // Postgres information
        const postgresVersion = await tm.db.query(`select version();`)
        const postgresDBSize = await tm.db.query(`select pg_size_pretty(pg_database_size(${await tm.db.query(`select current_database();`)}));`)

        return [
            dedicatedUptime, dedicatedVersion, dedicatedBuild, serverName, serverLogin,
            serverZone, serverRights, serverMaxPlayers, serverMaxSpecs, serverMaxRecs,
            serverMapCount, serverVisitorsCount, osUptime, osArch, osCPU, osCPULoad,
            osRAM, osKernel, trakmanVersion, trakmanUptime, nodeVersion, nodeRAMUsage,
            postgresVersion, postgresDBSize
        ]
    }

    protected async constructContent(login: string, params?: any, privilege?: number | undefined): Promise<string> {
        const info = await this.getInfo()
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
        const nameCell: GridCellFunction = (i, j, w, h): string => {
            return centeredText(config.cells[i - 1], w, h)
        }
        const infoCell: GridCellFunction = (i, j, w, h): string => {
            return centeredText((info as any)[i - 1], w, h)
        }
        const rows = config.cells.length
        const arr: (GridCellObject | GridCellFunction)[] = headers
        for (let i = 0; i < rows; i++) {
            arr.push(nameCell, infoCell)
        }
        return this.grid.constructXml(arr)
    }

    protected constructFooter(login: string, params?: any, privilege?: number | undefined): string | Promise<string> {
        return closeButton(this.closeId, this.windowWidth, this.footerHeight)
    }
}