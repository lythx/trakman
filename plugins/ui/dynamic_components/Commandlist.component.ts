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
  private readonly userPaginator: Paginator
  private readonly opPaginator: Paginator
  private readonly adminPaginator: Paginator
  private readonly masteradminPaginator: Paginator
  private readonly ownerPaginator: Paginator
  private readonly table: Grid
  private readonly commandLists: tm.Command[][] = []
  private readonly userCommands: tm.Command[]
  private readonly opCommands: tm.Command[]
  private readonly adminCommands: tm.Command[]
  private readonly masteradminCommands: tm.Command[]
  private readonly ownerCommands: tm.Command[]

  constructor() {
    super(componentIds.commandList, config.icon, config.title, config.navbar)
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
        }, `${page}/${e.pageCount}`)
      }
    }
    for (let i: number = 0; i <= 4; i++) {
      const arr = [this.userCommands, this.opCommands, this.adminCommands, this.masteradminCommands, this.ownerCommands].slice(0, i + 1)
      const commands: tm.Command[] = arr.flat(1)
      this.commandLists.push(commands)
      const pageCount: number = Math.ceil(commands.length / config.entries)
      const paginator: Paginator = new Paginator(this.openId + (i * 10), this.contentWidth, this.footerHeight, pageCount)
      paginator.onPageChange = (login: string, page: number): void => {
        this.displayToPlayer(login, { page, paginator, commands, privilege: i }, `${page}/${paginator.pageCount}`)
      }
      this.paginators.push(paginator)
    }
    this.table = new Grid(this.contentWidth, this.contentHeight, [1, 2, 2], new Array(config.entries).fill(1), config.grid)
    addManialinkListener(this.openId, 501, (info, offset) => {
      const arr: { [id: number]: [Paginator, tm.Command[]] } = {
        100: [this.userPaginator, this.userCommands],
        200: [this.opPaginator, this.opCommands],
        300: [this.adminPaginator, this.adminCommands],
        400: [this.masteradminPaginator, this.masteradminCommands],
        500: [this.ownerPaginator, this.ownerCommands]
      }
      const entry = arr[offset]
      if (entry !== undefined) {
        const page = entry[0].getPageByLogin(info.login)
        this.displayToPlayer(info.login, {
          paginator: entry[0], commands: entry[1],
          page, privilege: info.privilege, singleType: true
        }, `${page}/${entry[0].pageCount} `)
      }
    })
    tm.addListener("PrivilegeChanged", (info) => {
      const p: { login: string, params: DisplayParams } | undefined = this.getPlayersWithWindowOpen(true).find(a => a.login === info.login)
      if (p !== undefined) {
        if (info.newPrivilege < p.params.privilege || p.params.singleType === undefined) {
          const paginator: Paginator = this.paginators[info.newPrivilege]
          const commands: tm.Command[] = this.commandLists[info.newPrivilege]
          const page = paginator.getPageByLogin(info.login)
          this.displayToPlayer(info.login, { page, commands, paginator, privilege: info.newPrivilege }, `${page}/${paginator.pageCount}`)
        } else {
          this.displayToPlayer(info.login, { ...p.params, privilege: info.newPrivilege })
        }
      }
    })
    tm.commands.add({
      aliases: ['h', 'help', 'helpall'],
      help: 'Display the commands list.',
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: 0
    },)
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const player: tm.Player | undefined = tm.players.get(info.login)
    if (player === undefined) { return }
    const paginator: Paginator = this.paginators[player.privilege]
    const commands: tm.Command[] = this.commandLists[player.privilege]
    const page = paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page, commands, paginator, privilege: player.privilege }, `${page}/${paginator.pageCount}`)
  }

  protected constructNavbar(login: string, params: DisplayParams): string {
    const navCfg = [...config.navbar]
    let navbar
    if (params.privilege === 0) {
      navbar = new Navbar(config.userNavbar, this.contentWidth)
    } else if (params?.singleType === true) {
      const openCategory = [this.userPaginator, this.opPaginator, this.adminPaginator, this.masteradminPaginator, this.ownerPaginator].indexOf(params.paginator)
      navCfg.splice(openCategory + 1, 1)
      navbar = new Navbar(navCfg.slice(0, params.privilege + 1), this.contentWidth)
    } else {
      navbar = new Navbar(navCfg.slice(1, params.privilege + 2), this.contentWidth)
    }
    return navbar.constructXml()
  }

  protected constructContent(login: string, params: DisplayParams): string {
    const n = ((params.page - 1) * config.entries) - 1
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Aliases ', w, h),
      (i, j, w, h) => centeredText(' Arguments ', w, h),
      (i, j, w, h) => centeredText(' Comment ', w, h), // Space to prevent translation
    ]
    const nameCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      const text: string = command.aliases.join(', ')
      return centeredText(tm.utils.safeString(tm.utils.strip(text, true)), w, h)
    }
    const paramsCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      let text: string = ''
      let hasOptionals: boolean = false
      const commandParams = command.params
      if (commandParams !== undefined) {
        for (const [i, e] of commandParams.entries()) {
          if (e.optional === true && hasOptionals === false) {
            text += `[`
            hasOptionals = true
          }
          if (i === 0) { text += `${e.name} <${e.type ?? 'string'}> ` }
          else { text += `, ${e.name} <${e.type ?? 'string'}> ` }
        }
      }
      if (hasOptionals === true) { text += ']' }
      return centeredText(tm.utils.safeString(tm.utils.strip(text, true)), w, h)
    }
    const commentCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      return centeredText(tm.utils.safeString(tm.utils.strip(command.help ?? '', true)), w, h)
    }
    const arr: GridCellFunction[] = []
    arr.push(...headers)
    for (let i: number = 0; i < config.entries, params.commands[i + n + 1] !== undefined; i++) {
      arr.push(nameCell, paramsCell, commentCell)
    }
    return this.table.constructXml(arr)
  }

  protected constructFooter(login: string, params: DisplayParams): string {
    return closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin) + params.paginator.constructXml(params.page)
  }

}