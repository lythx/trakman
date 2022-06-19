import { TRAKMAN as TM } from "../../../src/Trakman.js";
import Paginator from "../Paginator.js";
import PopupWindow from "./PopupWindownew.js";
import IPopupWindow from "./PopupWindownew.interface.js";
import Table from '../Table.js'
import ICN from '../Icons.json' assert { type: 'json' }

export default class HelpWidget extends PopupWindow implements IPopupWindow {

  private readonly paginators: Paginator[] = []
  private readonly table: Table
  private readonly itemsPerPage = 15
  private readonly textScale = 0.7
  private readonly playerPages: { login: string, page: number }[] = []
  private readonly minPrivilege: number
  private readonly margin = 0.2

  constructor(openId: number, closeId: number) {
    super(openId, closeId, 56, 90)
    const privileges = TM.commandList.map(a => a.privilege)
    this.minPrivilege = Math.min(...privileges)
    const diff = Math.max(...privileges) - this.minPrivilege
    for (let i = 0; i <= diff; i++) {
      this.paginators.push(new Paginator(this.openId, this.closeId, this.minPrivilege + i))
    }
    this.table = new Table(56 - this.margin, 90 - this.margin, new Array(this.itemsPerPage).fill(1), [1, 1.7, 2, 0.3])
  }

  setupListeners(): void {
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      const player = TM.getPlayer(info.login)
      if (player === undefined) { return }
      const paginatorIndex = player.privilege - this.minPrivilege - 1
      const paginator = this.paginators[paginatorIndex]
      const pageCount = Math.ceil(TM.commandList.filter(a => a.privilege < info.privilege).length / this.itemsPerPage)
      paginator.updatePageCount(pageCount)
      const playerPage = this.playerPages.find(a => a.login === info.login)
      if (info.answer >= this.id + 1 && info.answer <= this.id + 6) {
        if (playerPage === undefined) { // Should never happen
          TM.error(`Can't find player ${info.login} in playerPages array in HelpWidget.`, `Clicked manialink id: ${info.answer}`)
          this.closeToPlayer(info.login)
          return
        }
        const page = paginator.getPageFromClick(info.answer, playerPage.page)
        playerPage.page = page
        this.displayToPlayer(info.login, { page, paginatorIndex, privilege: player.privilege, pageCount })
      } else if (info.answer === this.id) {
        this.playerPages.push({ login: info.login, page: 1 })
        this.displayToPlayer(info.login, { page: 1, paginatorIndex, privilege: player.privilege, pageCount })
      }
      else if (info.answer === this.closeId) { this.closeToPlayer(info.login) }
    })
  }

  constructHeader(login: string, params: { page: number, pageCount: number }): string {
    return this.defaultHeader('Command List', ICN.trophy, 2.5, 2.5, `${params.page}/${params.pageCount}`)
  }

  constructContent(login: string, params: { page: number, paginatorIndex: number, privilege: number }): string {
    const commands = TM.commandList.filter(a => a.help !== undefined && a.privilege <= params.privilege)
    const n = (params.page-1) * this.itemsPerPage
    const nameCell = (i: number, j: number, h: number, w: number): string => {
      const command = commands[i + n]
      if (command === undefined) { return '' }
      const text = command.aliases.join(', ')
      return `<quad posn="${this.margin} -${this.margin} 1" sizen="${w - this.margin} ${h - this.margin}" bgcolor="5556"/>
      <label posn="${w / 2} -${h / 2} 1" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
    }
    const paramsCell = (i: number, j: number, h: number, w: number): string => {
      const command = commands[i + n]
      if (command === undefined) { return '' }
      let text = ''
      let hasOptionals = false
      const params = command.params
      if (params !== undefined) {
        for (const [i, e] of params.entries()) {
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
      const command = commands[i + n]
      if (command === undefined) { return '' }
      return `<quad posn="${this.margin} -${this.margin} 1" sizen="${w - this.margin} ${h - this.margin}" bgcolor="5556"/>
      <label posn="${w / 2} -${h / 2} 3" sizen="${(w * (1 / this.textScale)) - 1} ${h}" scale="${this.textScale}" text="${TM.safeString(command.help ?? '')}" valign="center" halign="center"/>`
    }
    let arr: Function[] = []
    for (let i = 0; i < this.itemsPerPage; i++) {
      arr.push(nameCell, paramsCell, commentCell)
    }
    return this.table.constructXml(arr)
  }

  constructFooter(login: string, params: { page: number, paginatorIndex: number }): string {
    return this.paginators[params.paginatorIndex].constructXml(params.page)
  }

}