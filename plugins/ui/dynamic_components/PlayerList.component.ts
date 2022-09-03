import { trakman as tm } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { IDS, Grid, centeredText, closeButton } from '../UiUtils.js'
import config from './PlayerList.config.js'

export default class PlayerList extends PopupWindow {
  readonly headerGrid: Grid
  readonly grid: Grid
  readonly headerOffset: number
  readonly entries = config.entries

  /* ACTION IDS IN USE
    1000 - Kick
    2000 - Ban
    3000 - Mute
    4000 - Blacklist
    5000 - Guestlist
    6000 - ForceSpec
  */

  constructor() {
    const cProportions = config.columnProportions
    const headerProportions = [cProportions[0], cProportions[1], cProportions[2]]
    const title = config.title
    super(IDS.playerList, config.icon, title, config.navbar)
    this.headerOffset = this.contentHeight / this.entries
    this.grid = new Grid(this.contentWidth, this.contentHeight - this.headerOffset, cProportions, new Array(this.entries).fill(1))
    this.headerGrid = new Grid(this.contentWidth, this.contentHeight - this.headerOffset, cProportions, new Array(this.entries).fill(1), config.grid)

    //ACTIONS
    tm.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
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
        const status = await tm.admin.mute(targetPlayer.login, info)
        if (status instanceof Error) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}An error occured while muting the player.`, info.login)
        } else {
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has muted `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetPlayer.nickname)}${tm.utils.palette.admin}.`)
        }
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

      tm.commands.add( {
        aliases: ['players', 'playerlist'],
        help: 'Display list of players.',
        callback: (info: TMMessageInfo): void => tm.openManialink(this.openId, info.login),
        privilege: 1
      },)
    })
  }

  protected constructContent(login: string, params: any): string {
    const players = tm.players.list
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText(' Nickname ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Login ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Privilege ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Kick ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Ban ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Mute ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Blacklist ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Guestlist ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Forcespec ', w, h),
    ]
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(tm.utils.safeString(tm.utils.strip(players[i].nickname, false)), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(players[i].login, w, h)
    }
    const privilegeCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(players[i].privilege.toString(), w, h)
    }
    const kickCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${config.ban}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
    }
    const banCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${config.ban}" halign="center" valign="center" action="${this.openId + i + 2000}"/>`
    }
    const muteCell = (i: number, j: number, w: number, h: number): string => {
      const mutelist = tm.admin.mutelist
      let iconser = config.mute
      if (mutelist.some(a => a.login === players[i].login)) {
        iconser = config.ban
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2.5" image="${iconser}" halign="center" valign="center" action="${this.openId + i + 3000}"/>`

    }
    const blacklistCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${config.ban}" halign="center" valign="center" action="${this.openId + i + 4000}"/>`
    }
    const guestlistCell = (i: number, j: number, w: number, h: number): string => {
      let guestlist = tm.admin.guestlist
      let iconser = config.addGuest
      if (guestlist.some(a => a.login === players[i].login)) {
        iconser = config.removeGuest
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2.5" image="${iconser}" halign="center" valign="center" action="${this.openId + i + 5000}"/>`
    }
    const forcespecCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${config.ban}" halign="center" valign="center"/>`
    }
    const arr = []
    const rows = Math.min(this.entries, players.length)
    for (let i = 0; i < rows; i++) {
      arr.push(nickNameCell, loginCell, privilegeCell, kickCell, banCell, muteCell, blacklistCell, guestlistCell, forcespecCell)
    }
    return this.headerGrid.constructXml(headers) + `<frame posn="0 ${-this.headerOffset} 1">` + this.grid.constructXml(arr) + `</frame>`
  }

  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}