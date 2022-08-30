import PopupWindow from '../PopupWindow.js'
import { trakman as tm } from '../../../src/Trakman.js'
import { closeButton, IDS, Grid, centeredText } from '../UiUtils.js'
import config from './GuestlistList.config.js'

export default class GuestlistList extends PopupWindow {

  readonly grid: Grid

  constructor() {
    super(IDS.guestlistList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, new Array(config.entries).fill(1), config.grid)

    tm.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + 1000 && info.answer < this.openId + 2000) {

        const targetPlayer = tm.players.list[info.answer - this.openId - 1000]
        const targetInfo = tm.players.get(targetPlayer.login)
        if (targetInfo === undefined) {
          return
        } else {
          tm.admin.removeGuest(targetPlayer.login, info)
          tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed `
            + `${tm.utils.palette.highlight + targetPlayer.nickname}${tm.utils.palette.admin} from guestlist.`)
        }
      } // 

    })
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
      (i: number, j: number, w: number, h: number) => centeredText(' Date ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Admin ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Remove ', w, h, { padding: 0.2 }),

    ]
    const guestlisted = tm.admin.guestlist
    const cancer: (TMOfflinePlayer | undefined)[] = []

    for (const player of guestlisted) {
      cancer.push(await tm.players.fetch(player.login))
    }
    const nicknameCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(tm.utils.safeString(tm.utils.strip(cancer[i - 1]?.nickname ?? '', false)), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(guestlisted[i - 1].login, w, h)
    }
    const dateCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(guestlisted[i - 1].date.toUTCString(), w, h)
    }
    const adminCell = (i: number, j: number, w: number, h: number) => {
      return centeredText(guestlisted[i - 1].callerLogin, w, h)
    }
    const unglButton = (i: number, j: number, w: number, h: number) => {
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${config.icon}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
    }

    const players = tm.admin.guestlist
    const rows = Math.min(config.entries, players.length)
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(nicknameCell, loginCell, dateCell, adminCell, unglButton)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}