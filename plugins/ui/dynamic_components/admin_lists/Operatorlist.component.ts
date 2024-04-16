/**
 * @author wiseraven
 * @since 1.3.5
 */

import { closeButton, componentIds, Grid, centeredText, type GridCellFunction, Paginator, PopupWindow, addManialinkListener } from '../../UI.js'
import config from './Operatorlist.config.js'
import { actions } from '../../../actions/Actions.js'

export default class Operatorlist extends PopupWindow<{ page: number, privilege: number }> {

  readonly grid: Grid
  readonly paginator: Paginator

  constructor() {
    super(componentIds.oplist, config.icon, config.title, config.navbar, config.width)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, Math.ceil(tm.admin.opCount / (config.entries - 1)))
    this.paginator.onPageChange = (login, page, info) => {
      this.displayToPlayer(login, { page, privilege: info.privilege }, `${page}/${this.paginator.pageCount}`, info.privilege)
    }
    addManialinkListener(this.openId + 1000, 1000, async (info, offset) => {
      const target = tm.admin.oplist[offset]
      if (target === undefined) { return }
      await actions.setPlayerPrivilege(target.login, info, target.privilege + 1)
    })
    addManialinkListener(this.openId + 2000, 1000, async (info, offset) => {
      const target = tm.admin.oplist[offset]
      if (target === undefined) { return }
      await actions.setPlayerPrivilege(target.login, info, target.privilege - 1)
    })
    tm.addListener('PrivilegeChanged', () => {
      this.paginator.setPageCount(Math.ceil(tm.admin.opCount / config.entries))
      this.reRender()
    })
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.command.privilege
    })
    tm.addListener('PlayerDataUpdated', async () => this.reRender())
  }

  protected onOpen(info: tm.ManialinkClickInfo) {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page, privilege: info.privilege }, `${page}/${this.paginator.pageCount} `, tm.players.get(info.login)?.privilege ?? 0)
  }

  private reRender() {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      const page = this.paginator.getPageByLogin(player.login)
      this.displayToPlayer(player.login, { page, privilege: player.params.privilege }, `${page}/${this.paginator.pageCount} `, tm.players.get(player.login)?.privilege ?? 0)
    }
  }

  protected async constructContent(login: string, params: { page: number, privilege: number }) {
    const index = (params.page - 1) * (config.entries - 1) - 1
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Promote ', w, h),
      (i, j, w, h) => centeredText(' Demote ', w, h),
    ]
    const oplist = tm.admin.oplist
    const fetchedPlayers: tm.OfflinePlayer[] = await tm.players.fetch(oplist.map(a => a.login)) ?? []
    const indexCell: GridCellFunction = (i, j, w, h) => {
      return centeredText((i + index + 1).toString(), w, h)
    }
    const nicknameCell: GridCellFunction = (i, j, w, h) => {
      const nickname = fetchedPlayers.find(a => a.login === oplist[i + index].login)?.nickname
      return centeredText(tm.utils.safeString(tm.utils.strip(nickname ?? config.defaultNickname, false)), w, h)
    }
    const loginCell: GridCellFunction = (i, j, w, h) => oplist[i + index].login === login ?
      centeredText('$' + config.selfColour + oplist[i + index].login, w, h) : centeredText(oplist[i + index].login, w, h)
    const promoteButton: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + 1000 + index}"`
      let cover = ''
      if (params.privilege < 3) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.promoteIcon}"
    imagefocus="${config.promoteIconHover}" halign="center" valign="center"${actionStr}/> `
    }
    const demoteButton: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + 2000 + index}"`
      let cover = ''
      if (params.privilege < 2) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.demoteIcon}"
    imagefocus="${config.demoteIconHover}" halign="center" valign="center"${actionStr}/> `
    }
    const rows = Math.min((config.entries - 1), oplist.length - (index + 1))
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nicknameCell, loginCell, promoteButton, demoteButton)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) +
			this.paginator.constructXml(login)
  }

}
