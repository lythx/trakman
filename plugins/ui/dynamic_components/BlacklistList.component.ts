import PopupWindow from '../PopupWindow.js'
import {TRAKMAN as TM} from '../../../src/Trakman.js'
import { closeButton, CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, Paginator } from '../UiUtils.js'

export default class BlacklistList extends PopupWindow {
    readonly entries = CONFIG.blacklistList.entries
    readonly grid: Grid
    readonly gridMargin = CONFIG.grid.margin
    readonly paginator: Paginator

    constructor() {
        const iconurl = stringToObjectProperty(CONFIG.blacklistList.icon, ICONS)
        super(IDS.blacklistList, iconurl, CONFIG.blacklistList.title, CONFIG.blacklistList.navbar)
        this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.blacklistList.columnProportions, new Array(this.entries).fill(1),
        { headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin })

        TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo) => {
            if(info.answer >= this.openId + 1000 && info.answer < this.openId + 2000) {
  
              const targetPlayer = TM.players[info.answer - this.openId - 1000]
              const targetInfo = TM.getPlayer(targetPlayer.login)
              if(targetInfo === undefined) {
                return
              } else {
                TM.removeFromBlacklist(targetPlayer.login, info.login)
                TM.sendMessage('do format wizrvn PLZ TX')  
              }
            } //
    })
    const blacklist = TM.blacklist
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(blacklist.length/this.entries))
    this.paginator.onPageChange((login: string, page: number) => {
        const blacklist = TM.blacklist
        let pageCount =  Math.ceil(blacklist.length/this.entries)
        if(pageCount === 0) {
            pageCount = 1
        }
        this.paginator.updatePageCount(pageCount)

        this.displayToPlayer(login, {page}, `${page}/${pageCount}`)
    })
}

    private reRender(): void {
        const players = this.getPlayersWithWindowOpen()
        for (const login of players) {
          this.displayToPlayer(login)
        }
      }

    protected onOpen(info: ManialinkClickInfo): void {
        const blacklist = TM.blacklist
        let pageCount =  Math.ceil(blacklist.length/this.entries)
        if(pageCount === 0) {
            pageCount = 1
        }
        this.paginator.updatePageCount(pageCount)
        this.displayToPlayer(info.login, { page: 1 }, `1/${pageCount}`)
    }
      
    protected async constructContent(login: string, params: any): Promise<string> {
        const headers = [
            (i: number, j: number, w: number, h: number) => centeredText(' Nickname ', w, h),
            (i: number, j: number, w: number, h: number) => centeredText(' Login ', w, h),
            (i: number, j: number, w: number, h: number) => centeredText(' Expire Date ', w, h),
            (i: number, j: number, w: number, h: number) => centeredText(' Blacklist Reason ', w, h),
            (i: number, j: number, w: number, h: number) => centeredText(' Unblacklist ', w, h, {padding: 0.2}),
            
        ]
         const blacklisted = TM.blacklist
        // const blacklisted: BlacklistDBEntry[] = []
        // for(let i = 0; i<100; i++) {
        //     blacklisted.push({login: Math.random().toString(), expires: new Date(Math.random()), caller: Math.random().toString(), reason: Math.random().toString(), date: new Date(Math.random())})
        // }
         const fetchedPlayers: PlayersDBEntry[] = []

         for(const player of blacklisted) {
             fetchedPlayers.push(await TM.fetchPlayer(player.login))
         }
        const nicknameCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(fetchedPlayers[i - 1].nickname, w, h)
        }
        const loginCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(blacklisted[i - 1].login, w, h)
        }
        const dateCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(blacklisted[i - 1]?.expireDate?.toUTCString() ?? 'No date specified', w, h)
        }
        const reasonCell = (i: number, j: number, w: number, h: number) => {
            return centeredText(blacklisted[i - 1]?.reason ?? 'No reason specified', w, h)
        }
        const unblButton = (i: number, j: number, w: number, h: number) => {
            return `<quad posn="${w / 2} ${-h / 2} 1" sizen="2 2" image="${stringToObjectProperty(CONFIG.blacklistList.icon, ICONS)}" halign="center" valign="center" action="${this.openId + i + 1000}"/>`
        }

        const rows = Math.min(this.entries, blacklisted.length) 
        const arr = headers
        for(let i = 0; i<rows; i++) {
            arr.push(nicknameCell, loginCell, reasonCell, dateCell, unblButton)
        }
        return this.grid.constructXml(arr)
    }
    
    protected constructFooter(login: string, params: any): string {
        return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(params.page)
    }
}