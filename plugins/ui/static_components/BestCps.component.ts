import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { CONFIG, IDS, Grid, centeredText, rightAlignedText, verticallyCenteredText, stringToObjectProperty, ICONS, Paginator } from '../UiUtils.js'

export default class BestCps extends StaticComponent {

  private readonly margin = CONFIG.static.marginSmall
  private readonly width = CONFIG.static.width
  private readonly title = CONFIG.bestCps.title
  private readonly height = CONFIG.bestCps.height
  private readonly positionX = CONFIG.static.leftPosition + CONFIG.static.marginBig + CONFIG.static.width
  private readonly positionY = CONFIG.static.topBorder
  private readonly entries = CONFIG.bestCps.entries
  private readonly bestCps: { login: string, time: number, nickname: string }[] = []
  private readonly columnProportions = CONFIG.bestCps.columnProportions
  private readonly selfColour = CONFIG.bestCps.selfColour
  private readonly newestColour = CONFIG.bestCps.newestColour
  private readonly textScale = CONFIG.bestCps.textScale
  private readonly textPadding = CONFIG.bestCps.textPadding
  private readonly bg = CONFIG.static.bgColor
  private readonly headerBg = CONFIG.staticHeader.bgColor
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly contentHeight = this.height - (this.margin + this.headerHeight)
  private readonly squareW = CONFIG.staticHeader.squareWidth
  private readonly iconW = CONFIG.staticHeader.iconWidth
  private readonly iconH = CONFIG.staticHeader.iconHeight
  private readonly iconVPadding = CONFIG.staticHeader.iconVerticalPadding
  private readonly iconHPadding = CONFIG.staticHeader.iconHorizontalPadding
  private readonly icon = stringToObjectProperty(CONFIG.bestCps.icon, ICONS)
  private readonly upIcon = stringToObjectProperty(CONFIG.bestCps.upIcon, ICONS)
  private readonly downIcon = stringToObjectProperty(CONFIG.bestCps.downIcon, ICONS)
  private readonly paginator: Paginator
  private newestCp: number = -1
  private cpAmount: number
  private grid: Grid

  constructor() {
    super(IDS.bestCps, { displayOnRace: true, hideOnResult: true })
    this.cpAmount = TM.map.checkpointsAmount - 1
    this.grid = new Grid(this.width + this.margin * 2, this.contentHeight + this.margin * 2, this.columnProportions, new Array(this.entries).fill(1), { margin: this.margin })
    this.paginator = new Paginator(this.id, 0, 0, 0)
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      if (this.bestCps[info.index] === undefined || this.bestCps[info.index].time > info.time) {
        this.bestCps[info.index] = { login: info.player.login, time: info.time, nickname: info.player.nickname }
        this.paginator.setPageCount(Math.ceil(this.bestCps.length / this.entries))
        this.newestCp = info.index
        this.display()
      }
      const page = this.paginator.setPageForLogin(info.player.login, Math.ceil((info.index + 3) / this.entries))
      this.displayToPlayer(info.player.login, { page })
    })
    TM.addListener('Controller.BeginMap', () => {
      this.newestCp = -1
      this.cpAmount = TM.map.checkpointsAmount - 1
      this.paginator.setPageCount(1)
      this.paginator.resetPlayerPages()
      this.grid = new Grid(this.width + this.margin * 2, this.contentHeight + this.margin * 2, this.columnProportions, new Array(this.entries).fill(1), { margin: this.margin })
      this.bestCps.length = 0
      this.display()
    })
    this.paginator.onPageChange = (login: string) => {
      this.displayToPlayer(login)
    }
  }

  display(): void {
    this._isDisplayed = true
    for (const e of TM.players) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string, params?: { page?: number }): void {
    const page = params?.page === undefined ? this.paginator.getPageByLogin(login) : params.page

    const pageCount = this.paginator.pageCount
    TM.sendManialink(`
    <manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1"/>
      ${this.constructHeader(page, pageCount)}
    </frame>
    <frame posn="${this.positionX - this.margin} ${this.positionY - (this.headerHeight)} 1">
      <format textsize="1"/>
      ${this.constructText(login, page)}
    </frame>
    </manialink>`, login)
  }

  private constructHeader(page: number, pageCount: number): string {
    if (this.bestCps.length === 0) { return '' }
    let icons: (string | undefined)[] = [this.upIcon, this.downIcon]
    let ids: (number | undefined)[] = [this.paginator.ids[0], this.paginator.ids[1]]
    let buttonAmount = 2
    if (page === 1) {
      ids = [undefined, this.paginator.ids[1]]
      icons = [undefined, this.downIcon]
    } else if (page === pageCount) {
      icons = [this.upIcon]
      ids = [this.paginator.ids[0]]
    }
    if (pageCount === 1) {
      buttonAmount = 0
    }
    let buttonsXml = ''
    for (let i = 0; i < buttonAmount; i++) {
      const icon = icons[i] === undefined ? '' : `<quad posn="${this.iconHPadding} ${-this.iconVPadding} 4" sizen="${this.iconW} ${this.iconH}" image="${icons[i]}"/>`
      const action = ids[i] === undefined ? '' : `action="${ids[i]}"`
      buttonsXml += `<frame posn="${(this.width + this.margin) - (this.squareW + this.margin) * ((buttonAmount - i) + 1)} 0 1">
        <quad posn="0 0 1" sizen="${this.squareW} ${this.headerHeight}" bgcolor="${this.headerBg}" ${action}/>
        ${icon}
      </frame>`
    }
    return `<quad posn="0 0 1" sizen="${this.width - (this.squareW + this.margin) * (1 + buttonAmount)} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
      ${rightAlignedText(this.title, this.width - (this.squareW + this.margin) * (1 + buttonAmount), this.headerHeight, { textScale: CONFIG.staticHeader.textScale, yOffset: -0.1 })}
    <frame posn="${this.width - this.squareW} 0 1">
    <quad posn="0 0 1" sizen="${this.squareW} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
    <quad posn="${this.iconHPadding} ${-this.iconVPadding} 4" sizen="${this.iconW} ${this.iconH}" image="${this.icon}"/> 
    </frame>
    ${buttonsXml}
    `
  }

  private constructText(login: string, page: number): string {
    if (this.bestCps.length === 0) { return '' }
    // bestCps[i] can be undefined if someone was driving while controller was off (first indexes dont exist) so im just returning empty cells
    const cpIndex = this.entries * (page - 1)

    const indexCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.headerBg}"/>`
      return this.bestCps[i + cpIndex] === undefined ? '' : bg + (centeredText((i + 1 + cpIndex).toString(), w, h, { textScale: this.textScale, padding: this.textPadding }))
    }

    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.bg}"/>`
      const cp = this.bestCps[i + cpIndex]
      if (cp === undefined) { return '' }
      let format = cp.login === login ? `<format textcolor="${this.selfColour}"/>` : ''
      if (i + cpIndex === this.newestCp) { format = `<format textcolor="${this.newestColour}"/>` }
      return bg + format + centeredText(TM.Utils.getTimeString(cp.time), w, h, { textScale: this.textScale, padding: this.textPadding })
    }

    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.bg}"/>`
      return this.bestCps[i + cpIndex] === undefined ? '' : bg + (this.bestCps[i + cpIndex] === undefined ? '' : verticallyCenteredText(TM.strip(this.bestCps[i + cpIndex].nickname, false), w, h, { textScale: this.textScale, padding: this.textPadding }))
    }

    const cpsToDisplay = this.cpAmount - cpIndex
    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    for (let i = 0; i < cpsToDisplay; i++) {
      arr.push(indexCell, timeCell, nicknameCell)
    }
    return this.grid.constructXml(arr)
  }

}

