/**
 * @author lythx & Snake
 * @since 0.1
 */

import { actions } from '../../../actions/Actions.js'
import { componentIds, Grid, centeredText, closeButton, Paginator, type GridCellFunction, PopupWindow, addManialinkListener } from '../../UI.js'
import config from './Playerlist.config.js'

export default class PlayerList extends PopupWindow<{ page: number, privilege: number }> {

  readonly grid: Grid
  readonly paginator: Paginator
  readonly actions = {
    forceSpec: 1000,
    kick: 2000,
    mute: 3000,
    addGuest: 4000,
    blacklist: 5000,
    ban: 6000,
  }

  constructor() {
    super(componentIds.playerList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight,
      Math.ceil(tm.players.count / config.entries))
    this.paginator.onPageChange = (login, page, info) => {
      this.displayToPlayer(login, { page, privilege: info.privilege }, `${page}/${this.paginator.pageCount}`, info.privilege)
    }
    tm.addListener(['PlayerLeave', 'PlayerJoin', 'PlayerInfoChanged', 'Mute', 'Unmute', 'AddGuest', 'RemoveGuest'], () => {
      this.paginator.setPageCount(Math.ceil(tm.players.count / config.entries))
      this.reRender()
    })
    tm.addListener('PrivilegeChanged', (info) => {
      if (info.newPrivilege < config.privilege) { this.hideToPlayer(info.login) }
      this.reRender()
    })
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.command.privilege
    })
    tm.addListener('PlayerDataUpdated', () => this.reRender())
    addManialinkListener(this.openId + this.actions.kick, 1000, (info, offset) => {
      const target = tm.players.list[offset]
      if (target === undefined) { return }
      actions.kick(info, target)
    })
    addManialinkListener(this.openId + this.actions.forceSpec, 1000, (info, offset) => {
      const target = tm.players.list[offset]
      if (target === undefined) { return }
      if (target.isSpectator) {
        actions.forcePlay(info, target)
      } else {
        actions.forceSpectator(info, target)
      }
    })
    addManialinkListener(this.openId + this.actions.mute, 1000, (info, offset) => {
      const target = tm.players.list[offset]
      if (target === undefined) { return }
      if (tm.admin.getMute(target.login) === undefined) {
        actions.mute(info, target)
      } else {
        actions.unmute(info, target)
      }
    })
    addManialinkListener(this.openId + this.actions.addGuest, 1000, (info, offset) => {
      const target = tm.players.list[offset]
      if (target === undefined) { return }
      if (tm.admin.getGuest(target.login) === undefined) {
        actions.addGuest(info, target)
      } else {
        actions.removeGuest(info, target)
      }
    })
    addManialinkListener(this.openId + this.actions.blacklist, 1000, (info, offset) => {
      const target = tm.players.list[offset]
      if (target === undefined) { return }
      actions.blacklist(info, target)
    })
    addManialinkListener(this.openId + this.actions.ban, 1000, (info, offset) => {
      const target = tm.players.list[offset]
      if (target === undefined) { return }
      actions.ban(info, target)
    })
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page, privilege: info.privilege }, `${page}/${this.paginator.pageCount}`, info.privilege)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      const page = this.paginator.getPageByLogin(player.login)
      const privilege = tm.players.get(player.login)?.privilege ?? 0
      this.displayToPlayer(player.login, { page, privilege }, `${page}/${this.paginator.pageCount} `, privilege)
    }
  }

  protected constructContent(login: string, params: { page: number, privilege: number }): string {
    const page = params.page
    const privilege = params.privilege
    const index = (page - 1) * config.entries - 1
    const players = tm.players.list
    const mutelist = tm.admin.mutelist
    const guestlist = tm.admin.guestlist
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Privilege ', w, h),
      (i, j, w, h) => centeredText(' Kick ', w, h),
      (i, j, w, h) => centeredText(' Mute ', w, h),
      (i, j, w, h) => centeredText(' Blacklist ', w, h),
      (i, j, w, h) => centeredText(' Ban ', w, h),
      (i, j, w, h) => centeredText(' Guest ', w, h),
      (i, j, w, h) => centeredText(' Forcespec ', w, h),
    ]
    const indexCell: GridCellFunction = (i, j, w, h) => {
      return centeredText((i + index + 1).toString(), w, h)
    }
    const nicknameCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(tm.utils.safeString(tm.utils.strip(players[i + index].nickname, false)), w, h)
    }
    const loginCell: GridCellFunction = (i, j, w, h) => {
      let colour = ''
      if (players[i + index].login === login) { colour = '$' + config.selfColour }
      return centeredText(colour + players[i + index].login, w, h)
    }
    const privilegeCell: GridCellFunction = (i, j, w, h) => {
      const privilege = players[i + index].privilege
      return centeredText('$' + config.privilegeColours[privilege as keyof typeof config.privilegeColours]
        + players[i + index].privilege.toString(), w, h)
    }
    const kickCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.kick + index}"`
      let cover = ''
      if (params.privilege < config.kickPrivilege) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}" /> `
      }
      return `${cover} <quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.kick}"
    imagefocus="${config.hoverIcons.kick}" halign="center" valign="center"${actionStr} />`
    }
    const muteCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.mute + index}"`
      let cover = ''
      if (params.privilege < tm.config.controller.privileges.mute) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      let icon = config.icons.mute
      let hoverIcon = config.hoverIcons.mute
      if (mutelist.some(a => a.login === players[i + index].login)) {
        icon = config.icons.unmute
        hoverIcon = config.hoverIcons.unmute
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${hoverIcon}" halign="center" valign="center"${actionStr}/>`
    }
    const blacklistCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.blacklist + index}"`
      let cover = ''
      if (params.privilege < tm.config.controller.privileges.blacklist || params.privilege <= players[i + index].privilege) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.blacklist}"
      imagefocus="${config.hoverIcons.blacklist}" halign="center" valign="center"${actionStr}/>`
    }
    const banCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.ban + index}"`
      let cover = ''
      if (params.privilege < tm.config.controller.privileges.ban || params.privilege <= players[i + index].privilege) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.ban}"
      imagefocus="${config.hoverIcons.ban}" halign="center" valign="center"${actionStr}/>`
    }
    const guestCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.addGuest + index}"`
      let cover = ''
      if (params.privilege < tm.config.controller.privileges.addGuest) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      let icon = config.icons.addGuest
      let hoverIcon = config.hoverIcons.addGuest
      if (guestlist.some(a => a.login === players[i + index].login)) {
        icon = config.icons.removeGuest
        hoverIcon = config.hoverIcons.removeGuest
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${hoverIcon}" halign="center" valign="center"${actionStr}/>`
    }
    const forcespecCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.forceSpec + index}"`
      let cover = ''
      if (params.privilege < config.forceSpecPrivilege) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      let icon = config.icons.forceSpec
      let hoverIcon = config.hoverIcons.forceSpec
      if (players[i + index].isSpectator) {
        icon = config.icons.forcePlay
        hoverIcon = config.hoverIcons.forcePlay
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${hoverIcon}" halign="center" valign="center"${actionStr}/>`
    }
    const rows = Math.min(config.entries, players.length - (index + 1))
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nicknameCell, loginCell, privilegeCell,
        kickCell, muteCell, blacklistCell, banCell, guestCell, forcespecCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(login)
  }
}
