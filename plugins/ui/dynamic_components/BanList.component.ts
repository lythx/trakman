import PopupWindow from '../PopupWindow.js'
import { trakman as tm } from '../../../src/Trakman.js'
import { closeButton, IDS, Grid, centeredText } from '../UiUtils.js'
import config from './BanList.config.js'

export default class BanList extends PopupWindow {

  readonly entries = config.entries
  readonly grid: Grid

  constructor() {
    super(IDS.banList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, new Array(this.entries).fill(1), config.grid)

    tm.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + 1000 && info.answer < this.openId + 2000) {

        const targetPlayer = tm.players.list[info.answer - this.openId - 1000]
        const targetInfo = tm.players.get(targetPlayer.login)
        if (targetInfo === undefined) {
          return
        } else {
          tm.admin.unban(targetPlayer.login, info)
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has unbanned `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetPlayer.nickname)}${tm.utils.palette.admin}.`
          )
        }
      } // 

    })
    tm.commands.add(  {
      aliases: ['banlist'],
      help: 'Display list of banned players.',
      callback: (info: TMMessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: 1
    },)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      this.displayToPlayer(login)
    }
  }

  protected async constructContent(login: string, params: any): Promise<string> {
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText(' Nickname ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Login ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Ban Reason ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Ban Date ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Unban ', w, h),

    ]
    const bannedplayers = tm.admin.banlist
    const fetchedPlayers: (TMOfflinePlayer | undefined)[] = []

    for (const player of bannedplayers) {
      fetchedPlayers.push(await tm.players.fetch(player.login))
    }
    const nicknameCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(tm.utils.safeString(tm.utils.strip(fetchedPlayers[i - 1]?.nickname ?? '', false)), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(bannedplayers[i - 1]?.login ?? '', w, h)
    }
    const dateCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(bannedplayers[i - 1]?.expireDate?.toUTCString() ?? 'No date specified', w, h)
    }
    const reasonCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(tm.utils.safeString(bannedplayers[i - 1]?.reason ?? 'No reason specified'), w, h)
    }
    const unbanButton = (i: number, j: number, w: number, h: number) => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${config.icon}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
    }
    const rows = Math.min(this.entries, bannedplayers.length)
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(nicknameCell, loginCell, reasonCell, dateCell, unbanButton)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}