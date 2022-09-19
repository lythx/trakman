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
    const players = tm.players.list
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Nickname ', w, h),
      (i, j, w, h) => centeredText(' Login ', w, h),
      (i, j, w, h) => centeredText(' Privilege ', w, h),
      (i, j, w, h) => centeredText(' Kick ', w, h),
      (i, j, w, h) => centeredText(' Ban ', w, h),
      (i, j, w, h) => centeredText(' Mute ', w, h),
      (i, j, w, h) => centeredText(' Blacklist ', w, h),
      (i, j, w, h) => centeredText(' Guestlist ', w, h),
      (i, j, w, h) => centeredText(' Forcespec ', w, h),
    ]
    const nickNameCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(tm.utils.safeString(tm.utils.strip(players[i].nickname, false)), w, h)
    }
    const loginCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(players[i].login, w, h)
    }
    const privilegeCell: GridCellFunction = (i, j, w, h) => {
      return centeredText(players[i].privilege.toString(), w, h)
    }
    return ''
  }

  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}