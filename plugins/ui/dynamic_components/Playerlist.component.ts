import PopupWindow from '../PopupWindow.js'
import { IDS, Grid, centeredText, closeButton, Paginator, GridCellFunction } from '../UiUtils.js'
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
    super(IDS.playerList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight,
      Math.ceil(tm.players.count / config.entries))
    this.paginator.onPageChange = (login, page, info) => {
      this.displayToPlayer(login, { page, privilege: info.privilege }, `${page}/${this.paginator.pageCount}`, info.privilege)
    }
    tm.addListener(['PlayerLeave', 'PlayerJoin', 'PlayerInfoChanged', 'Mute', 'Unmute', 'AddGuest', 'RemoveGuest'], () => {
      this.paginator.setPageCount(Math.ceil(tm.admin.muteCount / config.entries))
      this.reRender()
    })
    tm.addListener('PrivilegeChanged', (info) => {
      if (info.newPrivilege < config.privilege) { this.hideToPlayer(info.login) }
      this.reRender()
    })
    tm.commands.add({
      aliases: ['players', 'playerl', 'playerlist'],
      help: 'Display playerlist.',
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.privilege
    })
    tm.addListener('PlayerInfoUpdated', () => this.reRender())
    tm.addListener('ManialinkClick', async (info: tm.ManialinkClickInfo) => {
      if (info.actionId >= this.openId + this.actions.kick
        && info.actionId < this.openId + this.actions.kick + 1000) { // Kick
        const target = tm.players.list[info.actionId - this.openId - this.actions.kick]
        if (target === undefined) { return }
        tm.client.callNoRes('Kick', [{ string: info.login }])
        tm.sendMessage(tm.utils.strVar(config.messages.kick, {
          title: info.title,
          adminName: tm.utils.strip(info.nickname),
          name: tm.utils.strip(target.nickname)
        }), config.public === true ? undefined : info.login)
      } else if (info.actionId >= this.openId + this.actions.forceSpec
        && info.actionId < this.openId + this.actions.forceSpec + 1000) { // ForceSpec and ForcePlay
        const target = tm.players.list[info.actionId - this.openId - this.actions.forceSpec]
        if (target === undefined) { return }
        if (target.isSpectator === true) { // ForcePlay
          tm.client.callNoRes('system.multicall',
            [{
              method: 'ForceSpectator',
              params: [{ string: target.login }, { int: 2 }]
            },
            {
              method: 'ForceSpectator',
              params: [{ string: target.login }, { int: 0 }]
            }])
          tm.sendMessage(tm.utils.strVar(config.messages.forcePlay, {
            title: info.title,
            adminName: tm.utils.strip(info.nickname),
            name: tm.utils.strip(target.nickname)
          }), config.public === true ? undefined : info.login)
        } else { // ForceSpec
          await tm.client.call('system.multicall',
            [{
              method: 'ForceSpectator',
              params: [{ string: target.login }, { int: 1 }]
            },
            {
              method: 'ForceSpectator',
              params: [{ string: target.login }, { int: 0 }]
            }])
          tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: target.login }])
          tm.sendMessage(tm.utils.strVar(config.messages.forceSpec, {
            title: info.title,
            adminName: tm.utils.strip(info.nickname),
            name: tm.utils.strip(target.nickname)
          }), config.public === true ? undefined : info.login)
        }
      } else if (info.actionId >= this.openId + this.actions.mute
        && info.actionId < this.openId + this.actions.mute + 1000) { // Mute
        const target = tm.players.list[info.actionId - this.openId - this.actions.mute]
        if (target === undefined) { return }
        if (tm.admin.getMute(target.login) === undefined) { // Mute
          await tm.admin.mute(target.login, info, target.nickname)
          tm.sendMessage(tm.utils.strVar(config.messages.mute, {
            title: info.title,
            adminName: tm.utils.strip(info.nickname),
            name: tm.utils.strip(target.nickname)
          }), config.public === true ? undefined : info.login)
        } else { // Unmute
          const status = await tm.admin.unmute(target.login, info)
          if (status instanceof Error) {
            tm.sendMessage(tm.utils.strVar(config.messages.unmuteError, { login: info.login }), info.login)
          } else {
            tm.sendMessage(tm.utils.strVar(config.messages.unmute, {
              title: info.title,
              adminName: tm.utils.strip(info.nickname),
              name: tm.utils.strip(target.nickname)
            }), config.public === true ? undefined : info.login)
          }
        }
      } else if (info.actionId >= this.openId + this.actions.addGuest
        && info.actionId < this.openId + this.actions.addGuest + 1000) { // AddGuest and RemoveGuest
        const target = tm.players.list[info.actionId - this.openId - this.actions.addGuest]
        if (target === undefined) { return }
        if (tm.admin.getGuest(target.login) === undefined) { // Add Guest
          const status = await tm.admin.addGuest(target.login, info, target.nickname)
          if (status instanceof Error) {
            tm.sendMessage(tm.utils.strVar(config.messages.addGuestError, { login: info.login }), info.login)
          } else {
            tm.sendMessage(tm.utils.strVar(config.messages.addGuest, {
              title: info.title,
              adminName: tm.utils.strip(info.nickname),
              name: tm.utils.strip(target.nickname)
            }), config.public === true ? undefined : info.login)
          }
        } else { // Remove Guest
          const status = await tm.admin.removeGuest(target.login, info)
          if (status instanceof Error) {
            tm.sendMessage(tm.utils.strVar(config.messages.removeGuestError, { login: info.login }), info.login)
          } else {
            tm.sendMessage(tm.utils.strVar(config.messages.removeGuest, {
              title: info.title,
              adminName: tm.utils.strip(info.nickname),
              name: tm.utils.strip(target.nickname)
            }), config.public === true ? undefined : info.login)
          }
        }
      } else if (info.actionId >= this.openId + this.actions.blacklist
        && info.actionId < this.openId + this.actions.blacklist + 1000) { // Blacklist
        const target = tm.players.list[info.actionId - this.openId - this.actions.blacklist]
        if (target === undefined) { return }
        const status = await tm.admin.addToBlacklist(target.login, info)
        if (status instanceof Error) {
          tm.sendMessage(tm.utils.strVar(config.messages.blacklistError, { login: info.login }), info.login)
        } else {
          tm.sendMessage(tm.utils.strVar(config.messages.blacklist, {
            title: info.title,
            adminName: tm.utils.strip(info.nickname),
            name: tm.utils.strip(target.nickname)
          }), config.public === true ? undefined : info.login)
        }
      } else if (info.actionId >= this.openId + this.actions.ban
        && info.actionId < this.openId + this.actions.ban + 1000) { // Ban
        const target = tm.players.list[info.actionId - this.openId - this.actions.ban]
        if (target === undefined) { return }
        await tm.admin.ban(target.ip, target.login, info)
        tm.sendMessage(tm.utils.strVar(config.messages.ban, {
          title: info.title,
          adminName: tm.utils.strip(info.nickname),
          name: tm.utils.strip(target.nickname)
        }))
      }
    })
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page, privilege: info.privilege }, `${page} /${this.paginator.pageCount}`, info.privilege)
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
      let privilege = players[i + index].privilege
      return centeredText('$' + config.privilegeColours[privilege as keyof typeof config.privilegeColours]
        + players[i + index].privilege.toString(), w, h)
    }
    const kickCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action = "${this.openId + i + this.actions.kick + index}"`
      let cover = ''
      if (params.privilege < config.kickPrivilege) {
        actionStr = ''
        cover = `< quad posn = "0 0 4" sizen = "${w} ${h}" bgcolor = "${config.disabledColour}" /> `
      }
      return `${cover} <quad posn="${w / 2} ${-h / 2} 1" sizen = "${config.iconWidth} ${config.iconHeight}" image = "${config.icons.kick}"
    imagefocus = "${config.hoverIcons.kick}" halign = "center" valign = "center"${actionStr} />`
    }
    const muteCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.mute + index}"`
      let cover = ''
      if (params.privilege < tm.config.privileges.mute) {
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
      if (params.privilege < tm.config.privileges.blacklist || params.privilege <= players[i + index].privilege) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.blacklist}"
      imagefocus="${config.hoverIcons.blacklist}" halign="center" valign="center"${actionStr}/>`
    }
    const banCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.ban + index}"`
      let cover = ''
      if (params.privilege < tm.config.privileges.ban || params.privilege <= players[i + index].privilege) {
        actionStr = ''
        cover = `<quad posn="0 0 4" sizen="${w} ${h}" bgcolor="${config.disabledColour}"/>`
      }
      return `${cover}<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.ban}"
      imagefocus="${config.hoverIcons.ban}" halign="center" valign="center"${actionStr}/>`
    }
    const guestCell: GridCellFunction = (i, j, w, h) => {
      let actionStr = ` action="${this.openId + i + this.actions.addGuest + index}"`
      let cover = ''
      if (params.privilege < tm.config.privileges.addGuest) {
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
      if (players[i + index].isSpectator === true) {
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
