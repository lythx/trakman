/**
 * @author lythx & wiseraven
 * @since 1.0
 */

import { componentIds, Grid, leftAlignedText, centeredText, closeButton, Paginator, type GridCellFunction, PopupWindow } from '../UI.js'
import config from './Chatlog.config.js'

export default class ChatLog extends PopupWindow<{ page: number }> {

  readonly grid: Grid
  readonly paginator: Paginator

  constructor() {
    super(componentIds.chatlog, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight,
      Math.ceil(tm.chat.messageCount / (config.entries - 1)))
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
    }
    tm.addListener(['PlayerChat'], () => {
      this.paginator.setPageCount(Math.ceil(tm.chat.messageCount / (config.entries - 1)))
      this.reRender()
    })
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.command.privilege
    })
    tm.addListener('PlayerDataUpdated', () => this.reRender())
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page }, `${page}/${this.paginator.pageCount}`)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      const page = this.paginator.getPageByLogin(player.login)
      this.displayToPlayer(player.login, { page }, `${page}/${this.paginator.pageCount} `)
    }
  }

  protected constructContent(login: string, params: { page: number }): string {
    const page = params.page
    const index = (page - 1) * (config.entries - 1) - 1
    const messages = tm.chat.messages.reverse()
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Date ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Message ', w, h),
    ]
    const dateCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(tm.utils.formatDate(messages[index + i].date, true), w, h)
    }
    const nicknameCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(tm.utils.safeString(tm.utils.safeString(tm.utils.strip(messages[index + i].nickname, false))), w, h)
    }
    const loginCell: GridCellFunction = (i, j, w, h) => {
      const playerLogin = messages[index + i].login
      return centeredText(login === playerLogin ? "$" + config.selfColour + playerLogin : playerLogin, w, h)
    }
    const messageCell: GridCellFunction = (i, j, w, h) => {
      return leftAlignedText(tm.utils.safeString(tm.utils.strip(messages[index + i].text.replace(`\n`, ` `))), w, h)
    }
    const rows = Math.min(config.entries - 1, messages.length - (index + 1))
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(dateCell, nicknameCell, loginCell, messageCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }
}
