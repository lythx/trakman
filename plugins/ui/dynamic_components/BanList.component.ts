import PopupWindow from '../PopupWindow.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { closeButton, CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText } from '../UiUtils.js'

export default class BanList extends PopupWindow {
    readonly entries = CONFIG.banList.entries
    readonly grid: Grid
    readonly gridMargin = CONFIG.grid.margin

    constructor() {
        const iconurl = stringToObjectProperty(CONFIG.banList.icon, ICONS)
        super(IDS.banList, iconurl, CONFIG.banList.title, CONFIG.banList.navbar)
        this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.banList.columnProportions, new Array(this.entries).fill(1),
            { headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })

        TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
            if (info.answer >= this.openId + 1000 && info.answer < this.openId + 2000) {

                const targetPlayer = TM.players[info.answer - this.openId - 1000]
                const targetInfo = TM.getPlayer(targetPlayer.login)
                if (targetInfo === undefined) {
                    return
                } else {
                    TM.removeFromBanlist(targetPlayer.login, info.login)
                    TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} `
                        + `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has unbanned `
                        + `${TM.palette.highlight + TM.strip(targetPlayer.nickname)}${TM.palette.admin}.`
                    )
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
            (i: number, j: number, w: number, h: number) => centeredText(' Ban Reason ', w, h),
            (i: number, j: number, w: number, h: number) => centeredText(' Ban Date ', w, h),
            (i: number, j: number, w: number, h: number) => centeredText(' Unban ', w, h),

        ]
        const bannedplayers = TM.banlist
        const fetchedPlayers: (TMOfflinePlayer | undefined)[] = []

        for (const player of bannedplayers) {
            fetchedPlayers.push(await TM.fetchPlayer(player.login))
        }
        const nicknameCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(TM.safeString(TM.strip(fetchedPlayers[i - 1]?.nickname ?? '', false)), w, h)
        }
        const loginCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(bannedplayers[i - 1]?.login ?? '', w, h)
        }
        const dateCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(bannedplayers[i - 1]?.expireDate?.toUTCString() ?? 'No date specified', w, h)
        }
        const reasonCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(TM.safeString(bannedplayers[i - 1]?.reason ?? 'No reason specified'), w, h)
        }
        const unbanButton = (i: number, j: number, w: number, h: number) => {
            return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.banList.icon, ICONS)}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
        }
        const players = TM.banlist
        const rows = Math.min(this.entries, players.length)
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