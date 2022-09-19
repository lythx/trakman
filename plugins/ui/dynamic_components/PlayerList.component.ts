import { trakman as tm } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { IDS, Grid, centeredText, closeButton, Paginator, GridCellFunction } from '../UiUtils.js'
import config from './PlayerList.config.js'

export default class PlayerList extends PopupWindow<number> {

  readonly grid: Grid
  readonly paginator: Paginator

  constructor() {
    super(IDS.playerList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight,
      Math.ceil(tm.players.count / config.entries))
    this.paginator.onPageChange = (login, page, info) => {
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`, info.privilege)
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
      callback: (info: TMMessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.privilege
    })


    //ACTIONS
    tm.addListener('ManialinkClick', async (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + 2000 && info.answer < this.openId + 3000) {

        const targetPlayer = tm.players.list[info.answer - this.openId - 2000]
        const targetInfo = tm.players.get(targetPlayer.login)
        if (targetInfo === undefined) {
          return
        } else {
          tm.admin.ban(targetInfo.ip, targetPlayer.login, info, targetInfo.nickname)
          tm.client.call('Kick', [{ string: targetPlayer.login }])
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has banned `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin}.`)
        }
      } // Ban

      if (info.answer >= this.openId + 3000 && info.answer < this.openId + 4000) {
        const targetPlayer = tm.players.list[info.answer - this.openId - 3000]
        await tm.admin.mute(targetPlayer.login, info)
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
          + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has muted `
          + `${tm.utils.palette.highlight + tm.utils.strip(targetPlayer.nickname)}${tm.utils.palette.admin}.`)

      } // Mute

      if (info.answer >= this.openId + 4000 && info.answer < this.openId + 6000) {
        const targetPlayer = tm.players.list[info.answer - this.openId - 4000]
        if (targetPlayer.login === undefined) {
          return
        } else {
          tm.admin.addToBlacklist(targetPlayer.login, info)
          tm.client.call('Kick', [{ string: targetPlayer.login }])
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has blacklisted `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetPlayer.nickname)}${tm.utils.palette.admin}.`)
        }
      } // Blacklist

      if (info.answer >= this.openId + 5000 && info.answer < this.openId + 6000) {
        const targetPlayer = tm.players.list[info.answer - this.openId - 5000]
        const status = await tm.admin.addGuest(targetPlayer.login, info)
        if (status instanceof Error) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}An error occured while adding player to the guestlist.`, info.login)
        } else {
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added `
            + `${tm.utils.palette.highlight + targetPlayer.nickname}${tm.utils.palette.admin} to guestlist.`)
        }
      } // Add to Guestlist

      //TODO: add ForceSpec :3 :v :D

      tm.commands.add({
        aliases: ['players', 'playerlist'],
        help: 'Display list of players.',
        callback: (info: TMMessageInfo): void => tm.openManialink(this.openId, info.login),
        privilege: 1
      },)
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, page, `${page}/${this.paginator.pageCount}`, info.privilege)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      const page = this.paginator.getPageByLogin(player.login)
      this.displayToPlayer(player.login, page, `${page}/${this.paginator.pageCount}`, tm.players.get(player.login)?.privilege ?? 0)
    }
  }

  protected constructContent(login: string, page: number): string {
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
      return centeredText(players[i + index].privilege.toString(), w, h)
    }
    const kickCell: GridCellFunction = (i, j, w, h) => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.kick}"
      imagefocus="${config.hoverIcons.kick}" halign="center" valign="center" action="${this.openId + i + 1000 + index}"/>`
    }
    const muteCell: GridCellFunction = (i, j, w, h) => {
      let icon = config.icons.mute
      let hoverIcon = config.hoverIcons.mute
      if (mutelist.some(a => a.login === players[i + index].login)) {
        icon = config.icons.unmute
        hoverIcon = config.hoverIcons.unmute
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${hoverIcon}" halign="center" valign="center" action="${this.openId + i + 2000 + index}"/>`
    }
    const blacklistCell: GridCellFunction = (i, j, w, h) => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.blacklist}"
      imagefocus="${config.hoverIcons.blacklist}" halign="center" valign="center" action="${this.openId + i + 3000 + index}"/>`
    }
    const banCell: GridCellFunction = (i, j, w, h) => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${config.icons.ban}"
      imagefocus="${config.hoverIcons.ban}" halign="center" valign="center" action="${this.openId + i + 4000 + index}"/>`
    }
    const guestCell: GridCellFunction = (i, j, w, h) => {
      let icon = config.icons.addGuest
      let hoverIcon = config.hoverIcons.addGuest
      if (guestlist.some(a => a.login === players[i + index].login)) {
        icon = config.icons.removeGuest
        hoverIcon = config.hoverIcons.removeGuest
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${hoverIcon}" halign="center" valign="center" action="${this.openId + i + 5000 + index}"/>`
    }
    const forcespecCell: GridCellFunction = (i, j, w, h) => {
      let icon = config.icons.forceSpec
      let hoverIcon = config.hoverIcons.forceSpec
      if (players[i + index].isSpectator === true) {
        icon = config.icons.forcePlay
        hoverIcon = config.hoverIcons.forcePlay
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${hoverIcon}" halign="center" valign="center" action="${this.openId + i + 6000 + index}"/>`
    }
    const rows = Math.min(config.entries, players.length - (index + 1))
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nicknameCell, loginCell, privilegeCell,
        kickCell, muteCell, blacklistCell, banCell, guestCell, forcespecCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, page: number): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(page)
  }
}