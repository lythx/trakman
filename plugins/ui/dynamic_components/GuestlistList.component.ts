import PopupWindow from '../PopupWindow.js'
import { trakman as TM } from '../../../src/Trakman.js'
import { closeButton, CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText } from '../UiUtils.js'

export default class GuestlistList extends PopupWindow {
    readonly entries = CONFIG.guestlistList.entries
    readonly grid: Grid
    readonly gridMargin = CONFIG.grid.margin


    constructor() {
        const iconurl = stringToObjectProperty(CONFIG.guestlistList.icon, ICONS)
        super(IDS.guestlistList, iconurl, CONFIG.guestlistList.title, CONFIG.guestlistList.navbar)
        this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.guestlistList.columnProportions, new Array(this.entries).fill(1),
            { headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })

        TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
            if (info.answer >= this.openId + 1000 && info.answer < this.openId + 2000) {

                const targetPlayer = TM.players.list[info.answer - this.openId - 1000]
                const targetInfo = TM.players.get(targetPlayer.login)
                if (targetInfo === undefined) {
                    return
                } else {
                    TM.removeFromGuestlist(targetPlayer.login, info.login)
                    TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
                        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed `
                        + `${TM.utils.palette.highlight + targetPlayer.nickname}${TM.utils.palette.admin} from guestlist.`)
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
        const guestlisted = TM.guestlist
        const cancer: (TMOfflinePlayer | undefined)[] = []

        for (const player of guestlisted) {
            cancer.push(await TM.players.fetch(player.login))
        }
        const nicknameCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(TM.utils.safeString(TM.utils.strip(cancer[i - 1]?.nickname ?? '', false)), w, h)
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
            return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.guestlistList.icon, ICONS)}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
        }

        const players = TM.guestlist
        const rows = Math.min(this.entries, players.length)
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