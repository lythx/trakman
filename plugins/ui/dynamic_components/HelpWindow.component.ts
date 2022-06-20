import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { Paginator, Grid, ICONS as ICN, Navbar, centeredText, headerIconTitleText, IDS } from "../UiUtils.js";
import PopupWindow from "../PopupWindow.js";

export default class HelpWindow extends PopupWindow {

  private readonly paginators: Paginator[] = []
  private readonly table: Grid
  private readonly itemsPerPage = 15
  private readonly textScale = 0.7
  private readonly minPrivilege: number
  private readonly margin = 0.2
  private readonly navbar: Navbar
  private readonly commandLists: TMCommand[][] = []

  constructor() {
    super(IDS.HelpWindow, 56, 90)
    const privileges = TM.commandList.map(a => a.privilege)
    this.minPrivilege = Math.min(...privileges)
    const diff = Math.max(...privileges) - this.minPrivilege
    for (let i = 0; i <= diff; i++) {
      const commands = TM.commandList.filter(a => a.help !== undefined && a.privilege <= this.minPrivilege + i)
      this.commandLists.push(commands)
      const pageCount = Math.ceil(commands.length / this.itemsPerPage)
      const paginator = new Paginator(this.openId + (i * 10), this.closeId, pageCount)
      paginator.onPageChange((login: string, page: number) => {
        this.displayToPlayer(login, { page, paginator, commands, privilege: this.minPrivilege + i, pageCount })
      })
      this.paginators.push(paginator)
    }
    this.navbar = new Navbar([{ name: 'penis', action: 1000 }, { name: 'sussy petya', action: 4321 }, { name: 'heheheha', action: 432145 }], 90)
    this.table = new Grid(90 - this.margin, 56 - (this.margin + this.navbar.height), [1, 2, 2], new Array(this.itemsPerPage).fill(1))
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const player = TM.getPlayer(info.login)
    if (player === undefined) { return }
    const privilegeIndex = player.privilege - this.minPrivilege
    const paginator = this.paginators[privilegeIndex]
    const commands = this.commandLists[privilegeIndex]
    const pageCount = paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, commands, paginator, privilege: player.privilege, pageCount })
  }

  protected constructHeader(login: string, params: { page: number, pageCount: number }): string {
    return headerIconTitleText('Command List', this.windowWidth, this.titleHeight, ICN.trophy, 2.5, 2.5, `${params.page}/${params.pageCount}`)
  }

  protected constructContent(login: string, params: { page: number, commands: TMCommand[], privilege: number }): string {
    const n = (params.page - 1) * this.itemsPerPage
    const headers = [
      (i: number, j: number, h: number, w: number): string => centeredText('Aliases', w, h),
      (i: number, j: number, h: number, w: number): string => centeredText('Arguments', w, h),
      (i: number, j: number, h: number, w: number): string => centeredText('Comment ', w, h), // Space to prevent translation
    ]
    const nameCell = (i: number, j: number, h: number, w: number): string => {
      const command = params.commands[i + n]
      if (command === undefined) { return '' }
      const text = command.aliases.join(', ')
      return `<quad posn="${this.margin} -${this.margin} 1" sizen="${w - this.margin} ${h - this.margin}" bgcolor="5556"/>
      <label posn="${w / 2} -${h / 2} 1" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
    }
    const paramsCell = (i: number, j: number, h: number, w: number): string => {
      const command = params.commands[i + n]
      if (command === undefined) { return '' }
      let text = ''
      let hasOptionals = false
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
      return `<quad posn="${this.margin} -${this.margin} 1" sizen="${w - this.margin} ${h - this.margin}" bgcolor="5556"/>
      <label posn="${w / 2} -${h / 2} 3" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
    }
    const commentCell = (i: number, j: number, h: number, w: number): string => {
      const command = params.commands[i + n]
      if (command === undefined) { return '' }
      return `<quad posn="${this.margin} -${this.margin} 1" sizen="${w - this.margin} ${h - this.margin}" bgcolor="5556"/>
      <label posn="${w / 2} -${h / 2} 3" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(command.help ?? '')}" valign="center" halign="center"/>`
    }
    const arr: Function[] = []
    arr.push(...headers)
    for (let i = 0; i < this.itemsPerPage; i++) {
      arr.push(nameCell, paramsCell, commentCell)
    }
    return `${this.navbar.constructXml()}
    <frame posn="0 -${this.navbar.height} 1">
    ${this.table.constructXml(arr)}
    </frame>`
  }

  protected constructFooter(login: string, params: { page: number, paginator: Paginator }): string {
    return params.paginator.constructXml(params.page)
  }

}