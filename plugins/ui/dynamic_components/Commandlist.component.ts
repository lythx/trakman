import { Paginator, Grid, centeredText, IDS, closeButton, Navbar, GridCellFunction } from "../UiUtils.js"
import PopupWindow from "../PopupWindow.js"
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
    super(IDS.commandList, config.icon, config.title, config.navbar)
    this.userCommands = tm.commands.list.filter(a => a.help !== undefined && a.privilege === 0)
    this.opCommands = tm.commands.list.filter(a => a.help !== undefined && a.privilege === 1)
    this.adminCommands = tm.commands.list.filter(a => a.help !== undefined && a.privilege === 2)
    this.masteradminCommands = tm.commands.list.filter(a => a.help !== undefined && a.privilege === 3)
    this.ownerCommands = tm.commands.list.filter(a => a.help !== undefined && a.privilege === 4)
    this.userPaginator = new Paginator(this.openId + 100, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / config.entries))
    this.opPaginator = new Paginator(this.openId + 200, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / config.entries))
    this.adminPaginator = new Paginator(this.openId + 300, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / config.entries))
    this.masteradminPaginator = new Paginator(this.openId + 400, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / config.entries))
    this.ownerPaginator = new Paginator(this.openId + 500, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / config.entries))
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
    tm.addListener("ManialinkClick", (info) => {
      if (info.actionId >= this.openId + 100 && info.actionId <= this.openId + 500) {
        switch (info.actionId - this.openId) {
          case 100: {
            const paginator = this.userPaginator
            const commands = this.userCommands
            const page = paginator.getPageByLogin(info.login)
            this.displayToPlayer(info.login, { paginator, commands, page, privilege: info.privilege, singleType: true }, `${page}/${paginator.pageCount}`)
            break
          }
          case 200: {
            const paginator = this.opPaginator
            const commands = this.opCommands
            const page = paginator.getPageByLogin(info.login)
            this.displayToPlayer(info.login, { paginator, commands, page, privilege: info.privilege, singleType: true }, `${page}/${paginator.pageCount}`)
            break
          }
          case 300: {
            const paginator = this.adminPaginator
            const commands = this.adminCommands
            const page = paginator.getPageByLogin(info.login)
            this.displayToPlayer(info.login, { paginator, commands, page, privilege: info.privilege, singleType: true }, `${page}/${paginator.pageCount}`)
            break
          }
          case 400: {
            const paginator = this.masteradminPaginator
            const commands = this.masteradminCommands
            const page = paginator.getPageByLogin(info.login)
            this.displayToPlayer(info.login, { paginator, commands, page, privilege: info.privilege, singleType: true }, `${page}/${paginator.pageCount}`)
            break
          }
          case 500:
            const paginator = this.ownerPaginator
            const commands = this.ownerCommands
            const page = paginator.getPageByLogin(info.login)
            this.displayToPlayer(info.login, { paginator, commands, page, privilege: info.privilege, singleType: true }, `${page}/${paginator.pageCount}`)
            break
        }
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
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / config.textScale)) - 1} ${h}" 
      scale="${config.textScale}" text="${tm.utils.safeString(tm.utils.strip(text, true))}" valign="center" halign="center"/>`
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
          if (i === 0) { text += `${e.name}<${e.type ?? 'string'}>` }
          else { text += `, ${e.name}<${e.type ?? 'string'}>` }
        }
      }
      if (hasOptionals === true) { text += ']' }
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / config.textScale)) - 1} ${h}" 
      scale="${config.textScale}" text="${tm.utils.safeString(tm.utils.strip(text, true))}" valign="center" halign="center"/>`
    }
    const commentCell: GridCellFunction = (i, j, w, h) => {
      const command: tm.Command = params.commands[i + n]
      if (command === undefined) { return '' }
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / config.textScale)) - 1} ${h}" 
      scale="${config.textScale}" text="${tm.utils.safeString(tm.utils.strip(command.help ?? '', true))}" valign="center" halign="center"/>`
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