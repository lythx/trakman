import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { Paginator, Grid, ICONS, centeredText, IDS, CONFIG, closeButton, stringToObjectProperty, Navbar, GridCellFunction } from "../UiUtils.js";
import PopupWindow from "../PopupWindow.js";

interface DisplayParams {
  page: number
  commands: TMCommand[]
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
  private readonly itemsPerPage: number = 15
  private readonly textScale: number = 0.7
  private readonly commandLists: TMCommand[][] = []
  private readonly userCommands: TMCommand[]
  private readonly opCommands: TMCommand[]
  private readonly adminCommands: TMCommand[]
  private readonly masteradminCommands: TMCommand[]
  private readonly ownerCommands: TMCommand[]

  constructor() {
    super(IDS.commandList, stringToObjectProperty(CONFIG.commandList.icon, ICONS), CONFIG.commandList.title, CONFIG.commandList.navbar)
    this.userCommands = TM.commandList.filter(a => a.help !== undefined && a.privilege === 0)
    this.opCommands = TM.commandList.filter(a => a.help !== undefined && a.privilege === 1)
    this.adminCommands = TM.commandList.filter(a => a.help !== undefined && a.privilege === 2)
    this.masteradminCommands = TM.commandList.filter(a => a.help !== undefined && a.privilege === 3)
    this.ownerCommands = TM.commandList.filter(a => a.help !== undefined && a.privilege === 4)
    this.userPaginator = new Paginator(this.openId + 100, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / this.itemsPerPage))
    this.opPaginator = new Paginator(this.openId + 200, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / this.itemsPerPage))
    this.adminPaginator = new Paginator(this.openId + 300, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / this.itemsPerPage))
    this.masteradminPaginator = new Paginator(this.openId + 400, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / this.itemsPerPage))
    this.ownerPaginator = new Paginator(this.openId + 500, this.contentWidth, this.footerHeight, Math.ceil(this.userCommands.length / this.itemsPerPage))
    const paginators = [this.userPaginator, this.opPaginator, this.adminPaginator, this.masteradminPaginator, this.ownerPaginator]
    const commands = [this.userCommands, this.opCommands, this.adminCommands, this.masteradminCommands, this.ownerCommands]
    for (const e of paginators) {
      e.onPageChange = (login: string, page: number): void => {
        const privilege = TM.players.get(login)?.privilege ?? 0
        this.displayToPlayer(login, {
          page, paginator: e, commands: commands[paginators.indexOf(e)], privilege, singleType: true
        }, `${page}/${e.pageCount}`)
      }
    }
    for (let i: number = 0; i <= 4; i++) {
      const arr = [this.userCommands, this.opCommands, this.adminCommands, this.masteradminCommands, this.ownerCommands].slice(0, i + 1)
      const commands: TMCommand[] = arr.flat(1)
      this.commandLists.push(commands)
      const pageCount: number = Math.ceil(commands.length / this.itemsPerPage)
      const paginator: Paginator = new Paginator(this.openId + (i * 10), this.contentWidth, this.footerHeight, pageCount)
      paginator.onPageChange = (login: string, page: number): void => {
        this.displayToPlayer(login, { page, paginator, commands, privilege: i }, `${page}/${paginator.pageCount}`)
      }
      this.paginators.push(paginator)
    }
    this.table = new Grid(this.contentWidth, this.contentHeight, [1, 2, 2], new Array(this.itemsPerPage).fill(1), { background: CONFIG.grid.bg, headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })
    TM.addListener("Controller.ManialinkClick", (info) => {
      if (info.answer >= this.openId + 100 && info.answer <= this.openId + 500) {
        switch (info.answer - this.openId) {
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
    TM.addListener("Controller.PrivilegeChanged", (info) => {
      const p: { login: string, params: DisplayParams } | undefined = this.getPlayersWithWindowOpen(true).find(a => a.login === info.login)
      if (p !== undefined) {
        if (info.newPrivilege < p.params.privilege || p.params.singleType === undefined) {
          const paginator: Paginator = this.paginators[info.newPrivilege]
          const commands: TMCommand[] = this.commandLists[info.newPrivilege]
          const page = paginator.getPageByLogin(info.login)
          this.displayToPlayer(info.login, { page, commands, paginator, privilege: info.newPrivilege }, `${page}/${paginator.pageCount}`)
        } else {
          this.displayToPlayer(info.login, { ...p.params, privilege: info.newPrivilege })
        }
      }
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const player: TMPlayer | undefined = TM.players.get(info.login)
    if (player === undefined) { return }
    const paginator: Paginator = this.paginators[player.privilege]
    const commands: TMCommand[] = this.commandLists[player.privilege]
    const page = paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page, commands, paginator, privilege: player.privilege }, `${page}/${paginator.pageCount}`)
  }

  protected constructNavbar(login: string, params: DisplayParams): string {
    const navCfg = [...CONFIG.commandList.navbar]
    let navbar
    if (params.privilege === 0) {
      navbar = new Navbar(CONFIG.commandList.userNavbar, this.contentWidth)
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
    const n = ((params.page - 1) * this.itemsPerPage) - 1
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Aliases ', w, h),
      (i, j, w, h) => centeredText(' Arguments ', w, h),
      (i, j, w, h) => centeredText(' Comment ', w, h), // Space to prevent translation
    ]
    const nameCell: GridCellFunction = (i, j, w, h) => {
      const command: TMCommand = params.commands[i + n]
      if (command === undefined) { return '' }
      const text: string = command.aliases.join(', ')
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.utils.safeString(TM.utils.strip(text, true))}" valign="center" halign="center"/>`
    }
    const paramsCell: GridCellFunction = (i, j, w, h) => {
      const command: TMCommand = params.commands[i + n]
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
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.utils.safeString(TM.utils.strip(text, true))}" valign="center" halign="center"/>`
    }
    const commentCell: GridCellFunction = (i, j, w, h) => {
      const command: TMCommand = params.commands[i + n]
      if (command === undefined) { return '' }
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.utils.safeString(TM.utils.strip(command.help ?? '', true))}" valign="center" halign="center"/>`
    }
    const arr: GridCellFunction[] = []
    arr.push(...headers)
    for (let i: number = 0; i < this.itemsPerPage, params.commands[i + n + 1] !== undefined; i++) {
      arr.push(nameCell, paramsCell, commentCell)
    }
    return this.table.constructXml(arr)
  }

  protected constructFooter(login: string, params: DisplayParams): string {
    return closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin) + params.paginator.constructXml(params.page)
  }

}