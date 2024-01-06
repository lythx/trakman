/**
 * @author lythx
 * @since 0.1
 */

import { Paginator, Grid, centeredText, componentIds, closeButton, Navbar, GridCellFunction, addManialinkListener, PopupWindow } from "../UI.js"
import config from './Commandlist.config.js'

interface DisplayParams {
  page: number
  commands: tm.Command[]
  paginator: Paginator
  privilege: number
  singleType?: true
}

export default class CommandList extends PopupWindow<DisplayParams> {

  private readonly paginators: Paginator[] = []
  private userPaginator!: Paginator
  private opPaginator!: Paginator
  private adminPaginator!: Paginator
  private masteradminPaginator!: Paginator
  private ownerPaginator!: Paginator
  private table!: Grid
  private commandLists: tm.Command[][] = []
  private userCommands: tm.Command[] = []
  private opCommands: tm.Command[] = []
  private adminCommands: tm.Command[] = []
  private masteradminCommands: tm.Command[] = []
  private ownerCommands: tm.Command[] = []
  private searchQueries: { login: string, privilege: number, list: tm.Command[], paginator: Paginator }[] = []
  private paginatorIdOffset = 0
  private readonly paginatorIdRange = 400 // Starts at 600

  constructor() {
    super(componentIds.commandList, config.icon, config.title, config.navbar)
    this.initializeListsAndPaginators()
    // Some commands get added on startup so possibly after this code
    // gets executed therefore need to check again after 10 seconds
    setTimeout(() => this.initializeListsAndPaginators(), 10000)
    addManialinkListener(this.openId, 501, (info, offset) => {
      const arr: { [id: number]: [Paginator, tm.Command[], string] } = {
        100: [this.userPaginator, this.userCommands, 'User Commands'],
        200: [this.opPaginator, this.opCommands, 'Operator Commands'],
        300: [this.adminPaginator, this.adminCommands, 'Admin Commands'],
        400: [this.masteradminPaginator, this.masteradminCommands, 'Masteradmin Commands'],
        500: [this.ownerPaginator, this.ownerCommands, 'Server Owner Commands']
      }
      const entry = arr[offset]
      if (entry !== undefined) {
        const page = entry[0].getPageByLogin(info.login)
        this.displayToPlayer(info.login, {
          paginator: entry[0], commands: entry[1],
          page, privilege: info.privilege, singleType: true
        }, `${page}/${entry[0].pageCount}`, info.privilege, entry[2])
      }
    })
    tm.addListener("PrivilegeChanged", (info) => {
      const p: { login: string, params: DisplayParams } | undefined = this.getPlayersWithWindowOpen(true).find(a => a.login === info.login)
      if (p !== undefined) {
        // Handling list change on search query would be quite complex and its 
        // very unlikely to occur so I just leave the window as it is in that case
        if (this.searchQueries.find(a => a.login === p.login) !== undefined) {
          return
        }
        if (info.newPrivilege < p.params.privilege || p.params.singleType === undefined) {
          const paginator: Paginator = this.paginators[info.newPrivilege]
          const commands: tm.Command[] = this.commandLists[info.newPrivilege]
          const page = paginator.getPageByLogin(info.login)
          this.displayToPlayer(info.login, { page, commands, paginator, privilege: info.newPrivilege }, `${page}/${paginator.pageCount}`, info.newPrivilege)
        } else {
          this.displayToPlayer(info.login, { ...p.params, privilege: info.newPrivilege }, `0/${p.params.paginator.pageCount}`, info.newPrivilege)
        }
      }
    })
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      params: [{ name: 'query', optional: true }],
      callback: (info: tm.MessageInfo, query?: string): void => {
        if (query !== undefined) {
          this.openWithQuery(info.login, info.privilege, query)
        } else {
          tm.openManialink(this.openId, info.login)
        }
      },
      privilege: config.command.privilege
    })
  }

  private initializeListsAndPaginators() {
    this.userPaginator?.destroy()
    this.opPaginator?.destroy()
    this.adminPaginator?.destroy()
    this.masteradminPaginator?.destroy()
    this.ownerPaginator?.destroy()
    for (const e of this.paginators) {
      e.destroy()
    }
    this.paginators.length = 0
    const commandList = tm.commands.list
    this.userCommands = commandList.filter(a => a.help !== undefined && a.privilege === 0)
    this.opCommands = commandList.filter(a => a.help !== undefined && a.privilege === 1)
    this.adminCommands = commandList.filter(a => a.help !== undefined && a.privilege === 2)
    this.masteradminCommands = commandList.filter(a => a.help !== undefined && a.privilege === 3)
    this.ownerCommands = commandList.filter(a => a.help !== undefined && a.privilege === 4)
    this.userPaginator = new Paginator(this.openId + 100, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / config.entries))
    this.opPaginator = new Paginator(this.openId + 200, this.contentWidth, this.footerHeight, Math.ceil(this.opCommands.length / config.entries))
    this.adminPaginator = new Paginator(this.openId + 300, this.contentWidth, this.footerHeight, Math.ceil(this.adminCommands.length / config.entries))
    this.masteradminPaginator = new Paginator(this.openId + 400, this.contentWidth, this.footerHeight, Math.ceil(this.masteradminCommands.length / config.entries))
    this.ownerPaginator = new Paginator(this.openId + 500, this.contentWidth, this.footerHeight, Math.ceil(this.ownerCommands.length / config.entries))
    const paginators = [this.userPaginator, this.opPaginator, this.adminPaginator, this.masteradminPaginator, this.ownerPaginator]
    const commands = [this.userCommands, this.opCommands, this.adminCommands, this.masteradminCommands, this.ownerCommands]
    for (const e of paginators) {
      e.onPageChange = (login: string, page: number): void => {
        const privilege = tm.players.get(login)?.privilege ?? 0
        this.displayToPlayer(login, {
          page, paginator: e, commands: commands[paginators.indexOf(e)], privilege, singleType: true
        }, `${page}/${e.pageCount}`, privilege)
      }
    }
    this.commandLists.length = 0
    for (let i: number = 0; i <= 4; i++) {
      const arr = [this.userCommands, this.opCommands, this.adminCommands, this.masteradminCommands, this.ownerCommands].slice(0, i + 1)
      const commands: tm.Command[] = arr.flat(1)
      this.commandLists.push(commands)
      const pageCount: number = Math.ceil(commands.length / config.entries)
      const paginator: Paginator = new Paginator(this.openId + (i * 10), this.contentWidth, this.footerHeight, pageCount)
      paginator.onPageChange = (login: string, page: number, info): void => {
        this.displayToPlayer(login, { page, paginator, commands, privilege: i }, `${page}/${paginator.pageCount}`, info.privilege)
      }
      this.paginators.push(paginator)
    }
    this.table = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, new Array(config.entries).fill(1), config.grid)
  }

  openWithQuery(login: string, privilege: number, query: string) {
    const commands = [this.userCommands, this.opCommands, this.adminCommands, this.masteradminCommands,
    this.ownerCommands].slice(0, privilege + 1).flat(1)
    const aliases = commands.map(a => a.aliases).flat(1)
    const matchedAliases = tm.utils.matchString(query, aliases)
    const aliasValues: ({ obj: tm.Command, value: number })[] = []
    if(config.aliasSearch) {
      for (const e of commands) {
        const value = matchedAliases.find((a) => e.aliases.includes(a.str))?.value
        if (value !== undefined) {
          aliasValues.push({ obj: e, value })
        }
      }
    }
    const list: tm.Command[] = [...tm.utils.matchString(query, commands, "help"), ...aliasValues]
      .sort((a, b) => b.value - a.value).filter(a => a.value > config.minimumMatchSimilarity).map(a => a.obj)
      .filter((a, i, arr) => arr.indexOf(a) === i)
    if (list.length === 0) {
      tm.sendMessage(tm.utils.strVar(config.noMatchesMessage, { query }), login)
      return
    }
    const paginatorId = (this.openId + 600 + this.paginatorIdOffset) % this.paginatorIdRange
    this.paginatorIdOffset++
    const paginator = new Paginator(paginatorId, this.contentWidth,
      this.footerHeight, Math.ceil(list.length / config.entries))
    paginator.onPageChange = (login: string, page: number, info): void => {
      this.displayToPlayer(login, { page, paginator, commands: list, privilege },
        `${page}/${paginator.pageCount}`, info.privilege)
    }
    this.searchQueries.push({
      login,
      privilege,
      list,
      paginator
    })
    this.displayToPlayer(login, { page: 1, commands: list, paginator, privilege },
      `1/${paginator.pageCount}`, privilege)
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const player: tm.Player | undefined = tm.players.get(info.login)
    if (player === undefined) { return }
    const paginator: Paginator = this.paginators[player.privilege]
    const commands: tm.Command[] = this.commandLists[player.privilege]
    const page = paginator.getPageByLogin(info.login)
    const index: number = this.searchQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.searchQueries[index].paginator.destroy()
      this.searchQueries.splice(index, 1)
    }
    this.displayToPlayer(info.login, { page, commands, paginator, privilege: player.privilege }, `${page}/${paginator.pageCount}`, info.privilege)
  }

  protected onClose(info: tm.ManialinkClickInfo): void {
    const index: number = this.searchQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.searchQueries[index].paginator.destroy()
      this.searchQueries.splice(index, 1)
    }
    this.hideToPlayer(info.login)
  }

  protected constructContent(login: string, params: DisplayParams): string {
    const n = ((params.page - 1) * config.entries) - 1
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' P ', w, h),
      (i, j, w, h) => centeredText(' Aliases ', w, h),
      (i, j, w, h) => centeredText(' Arguments ', w, h),
      (i, j, w, h) => centeredText(' Comment ', w, h), // Space to prevent translation
    ]
    const privCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      const text: string = config.slashesForPrivilege ? (command.privilege > 0 ? '//' : '/') : command.privilege.toString()
      return centeredText(tm.utils.safeString(tm.utils.strip(text, true)), w, h)
    }
    const nameCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      const text: string = command.aliases.join(', ')
      return centeredText(tm.utils.safeString(tm.utils.strip(text, true)), w, h)
    }
    const paramsCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      const text = tm.utils.stringifyCommandParams(command.params)
      return centeredText(tm.utils.safeString(tm.utils.strip(text, true)), w, h)
    }
    const commentCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command?.help === undefined) { return '' }
      return centeredText(tm.utils.safeString(command.help), w, h)
    }
    const arr: GridCellFunction[] = []
    arr.push(...headers)
    for (let i: number = 0; i < config.entries, params.commands[i + n + 1] !== undefined; i++) {
      arr.push(privCell, nameCell, paramsCell, commentCell)
    }
    return this.table.constructXml(arr)
  }

  protected constructFooter(login: string, params: DisplayParams): string {
    return closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin) + params.paginator.constructXml(params.page)
  }

}