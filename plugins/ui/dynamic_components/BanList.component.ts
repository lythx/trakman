import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, stringToObjectProperty, IDS, Grid, centeredText, closeButton } from '../UiUtils.js'

export default class BanList extends PopupWindow {
    readonly headerGrid: Grid
    readonly entries = CONFIG.banList.entries
    readonly grid: Grid
    readonly headerOffset: number

    constructor() {
        const cProportions = CONFIG.playerList.columnProportions
        const iconer = stringToObjectProperty(CONFIG.banList.icon, ICONS)
        super(IDS.banList, iconer, CONFIG.banList.title, CONFIG.banList.navbar)
        this.headerOffset = this.contentHeight / this.entries
        this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.banList.columnProportions, new Array(this.entries).fill(1))
        this.headerGrid = new Grid(this.contentWidth, this.contentHeight - this.headerOffset, cProportions, new Array(this.entries).fill(1), {headerBg: CONFIG.grid.headerBg, margin: CONFIG.grid.margin})
    }

    protected constructContent(login: string, params: any): string {
        return ''
    }

    protected constructFooter(login: string, params: any): string {
        return closeButton(this.closeId, this.windowWidth, this.footerHeight)
    }
}

//not caring atm