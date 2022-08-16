import { trakman as tm } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, IDS, stringToObjectProperty, ICONS, Grid, centeredText, closeButton } from '../UiUtils.js'

export default class PlayerList extends PopupWindow {
  readonly headerGrid: Grid
  readonly grid: Grid
  readonly headerOffset: number
  readonly entries = CONFIG.playerList.entries

  /* ACTION IDS IN USE
    1000 - Kick
    2000 - Ban
    3000 - Mute
    4000 - Blacklist
    5000 - Guestlist
    6000 - ForceSpec
  */

  constructor() {
    const cProportions = CONFIG.playerList.columnProportions
    const headerProportions = [cProportions[0], cProportions[1], cProportions[2]]
    const title = CONFIG.playerList.title
    const iconer = stringToObjectProperty(CONFIG.playerList.icon, ICONS)
    super(IDS.playerList, iconer, title, CONFIG.mapList.navbar)
    this.headerOffset = this.contentHeight / this.entries
    this.grid = new Grid(this.contentWidth, this.contentHeight - this.headerOffset, cProportions, new Array(this.entries).fill(1))
    this.headerGrid = new Grid(this.contentWidth, this.contentHeight - this.headerOffset, cProportions, new Array(this.entries).fill(1), { headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })

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
        const status = await tm.addToMutelist(targetPlayer.login, info.login)
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
          tm.addToBlacklist(targetPlayer.login, info.login)
          tm.client.call('Kick', [{ string: targetPlayer.login }])
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has blacklisted `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetPlayer.nickname)}${tm.utils.palette.admin}.`)
        }
      } // Blacklist

      if (info.answer >= this.openId + 5000 && info.answer < this.openId + 6000) {
        const targetPlayer = tm.players.list[info.answer - this.openId - 5000]
        const status = await tm.addToGuestlist(targetPlayer.login, info.login)
        if (status instanceof Error) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}An error occured while adding player to the guestlist.`, info.login)
        } else {
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added `
            + `${tm.utils.palette.highlight + targetPlayer.nickname}${tm.utils.palette.admin} to guestlist.`)
        }
      } // Add to Guestlist

      //TODO: add ForceSpec :3 :v :D
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
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.playerList.ban, ICONS)}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
    }
    const banCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.playerList.ban, ICONS)}" halign="center" valign="center" action="${this.openId + i + 2000}"/>`
    }
    const muteCell = (i: number, j: number, w: number, h: number): string => {
      const mutelist = tm.mutelist
      let iconser = stringToObjectProperty(CONFIG.playerList.mute, ICONS)
      if (mutelist.some(a => a.login === players[i].login)) {
        iconser = stringToObjectProperty(CONFIG.playerList.ban, ICONS)
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2.5" image="${iconser}" halign="center" valign="center" action="${this.openId + i + 3000}"/>`

    }
    const blacklistCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.playerList.ban, ICONS)}" halign="center" valign="center" action="${this.openId + i + 4000}"/>`
    }
    const guestlistCell = (i: number, j: number, w: number, h: number): string => {
      let guestlist = tm.guestlist
      let iconser = stringToObjectProperty(CONFIG.playerList.addGuest, ICONS)
      if (guestlist.some(a => a.login === players[i].login)) {
        iconser = stringToObjectProperty(CONFIG.playerList.removeGuest, ICONS)
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2.5" image="${iconser}" halign="center" valign="center" action="${this.openId + i + 5000}"/>`
    }
    const forcespecCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.playerList.ban, ICONS)}" halign="center" valign="center"/>`
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