import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { Paginator, Grid, ICONS, centeredText, headerIconTitleText, IDS, CONFIG, closeButton } from "../UiUtils.js";
import PopupWindow from "../PopupWindow.js";

export default class CommandList extends PopupWindow {

  private readonly paginators: Paginator[] = []
  private readonly table: Grid
  private readonly itemsPerPage: number = 15
  private readonly textScale: number = 0.7
  private readonly minPrivilege: number
  private readonly commandLists: TMCommand[][] = []

  constructor() {
    super(IDS.CommandList, ICONS.mxLogo, 'Command List', [{ name: 'penis', action: 1000 }, { name: 'sussy petya', action: 4321 }, { name: 'heheheha', action: 432145 }])
    const privileges: number[] = TM.commandList.map(a => a.privilege)
    this.minPrivilege = Math.min(...privileges)
    const diff: number = Math.max(...privileges) - this.minPrivilege
    for (let i: number = 0; i <= diff; i++) {
      const commands: TMCommand[] = TM.commandList.filter(a => a.help !== undefined && a.privilege <= this.minPrivilege + i)
      this.commandLists.push(commands)
      const pageCount: number = Math.ceil(commands.length / this.itemsPerPage)
      const paginator: Paginator = new Paginator(this.openId + (i * 10), this.contentWidth, this.headerHeight - this.margin, pageCount)
      paginator.onPageChange((login: string, page: number): void => {
        this.displayToPlayer(login, { page, paginator, commands, privilege: this.minPrivilege + i, pageCount })
      })
      this.paginators.push(paginator)
    }
    this.table = new Grid(this.contentWidth - this.margin, this.contentHeight - this.margin * 2, [1, 2, 2], new Array(this.itemsPerPage).fill(1), { headerBg: CONFIG.grid.headerBg, background: CONFIG.grid.bg })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const player: TMPlayer | undefined = TM.getPlayer(info.login)
    if (player === undefined) { return }
    const privilegeIndex: number = player.privilege - this.minPrivilege
    const paginator: Paginator = this.paginators[privilegeIndex]
    const commands: TMCommand[] = this.commandLists[privilegeIndex]
    const pageCount: number = paginator.pageCount
    this.displayToPlayer(info.login, { page: 1, commands, paginator, privilege: player.privilege, pageCount })
  }

  protected constructHeader(login: string, params: { page: number, pageCount: number }): string {
    return headerIconTitleText('Command List', this.windowWidth, this.headerHeight, '', 2.5, 2.5, `${params.page}/${params.pageCount}`)
  }

  protected constructContent(login: string, params: { page: number, commands: TMCommand[], privilege: number }): string {
    const n: number = ((params.page - 1) * this.itemsPerPage) - 1
    const headers = [
      (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Aliases', w, h),
      (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Arguments', w, h),
      (i: number, j: number, w: number, h: number): string => centeredText(CONFIG.static.format + 'Comment ', w, h), // Space to prevent translation
    ]
    const nameCell = (i: number, j: number, w: number, h: number): string => {
      const command: TMCommand = params.commands[i + n]
      if (command === undefined) { return '' }
      const text: string = command.aliases.join(', ')
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
    }
    const paramsCell = (i: number, j: number, w: number, h: number): string => {
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
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
    }
    const commentCell = (i: number, j: number, w: number, h: number): string => {
      const command: TMCommand = params.commands[i + n]
      if (command === undefined) { return '' }
      return `<label posn="${w / 2} -${h / 2} 4" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(command.help ?? '')}" valign="center" halign="center"/>`
    }
    const arr: any[] = []
    arr.push(...headers)
    for (let i: number = 0; i < this.itemsPerPage, params.commands[i + n + 1] !== undefined; i++) {
      arr.push(nameCell, paramsCell, commentCell)
    }
    return `<frame posn="0 ${-this.margin} 1">
    ${this.table.constructXml(arr)}
    </frame>`
  }

  protected constructFooter(login: string, params: { page: number, paginator: Paginator }): string {
    return closeButton(this.closeId, this.windowWidth, this.headerHeight - this.margin) + params.paginator.constructXml(params.page)
  }

}