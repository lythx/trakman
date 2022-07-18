import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { CONFIG, IDS, Grid, centeredText, verticallyCenteredText, stringToObjectProperty, ICONS, Paginator } from '../UiUtils.js'

export default class BestFinishes extends StaticComponent {

  private readonly margin = CONFIG.static.marginSmall
  private readonly width = CONFIG.bestFinishes.width
  private readonly title = CONFIG.bestFinishes.title
  private readonly height = CONFIG.bestFinishes.height
  private readonly positionX = CONFIG.static.rightPosition - (CONFIG.static.marginBig + CONFIG.bestFinishes.width)
  private readonly positionY = CONFIG.static.topBorder
  private readonly entries = CONFIG.bestFinishes.entries
  private readonly bestFinishes: { login: string, time: number, nickname: string }[] = []
  private readonly columnProportions = CONFIG.bestFinishes.columnProportions
  private readonly selfColour = CONFIG.bestFinishes.selfColour
  private readonly newestColour = CONFIG.bestFinishes.newestColour
  private readonly textScale = CONFIG.bestFinishes.textScale
  private readonly textPadding = CONFIG.bestFinishes.textPadding
  private readonly bg = CONFIG.static.bgColor
  private readonly headerBg = CONFIG.staticHeader.bgColor
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly contentHeight = this.height - (this.margin + this.headerHeight)
  private readonly squareW = CONFIG.staticHeader.squareWidth
  private readonly iconW = CONFIG.staticHeader.iconWidth
  private readonly iconH = CONFIG.staticHeader.iconHeight
  private readonly iconVPadding = CONFIG.staticHeader.iconVerticalPadding
  private readonly iconHPadding = CONFIG.staticHeader.iconHorizontalPadding
  private readonly icon = stringToObjectProperty(CONFIG.bestFinishes.icon, ICONS)
  private readonly grid: Grid
  private newestFinish: number = -1

  constructor() {
    super(IDS.bestFinishes, 'race')
    this.grid = new Grid(this.width + this.margin * 2, this.contentHeight + this.margin * 2, this.columnProportions, new Array(this.entries).fill(1), { margin: this.margin })
    TM.addListener('Controller.PlayerFinish', (info: FinishInfo) => {
      let index = this.bestFinishes.findIndex(a => a.time > info.time)
      if (index === -1) { index = this.bestFinishes.length }
      if (index < this.entries) {
        this.bestFinishes.splice(index, 0, { login: info.login, time: info.time, nickname: info.nickName })
        this.bestFinishes.length = Math.min(this.entries, this.bestFinishes.length)
        this.newestFinish = index
        this.display()
      }
    })
    TM.addListener('Controller.BeginMap', () => {
      this.newestFinish = -1
      this.bestFinishes.length = 0
      this.display()
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const e of TM.players) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1"/>
      ${this.constructHeader()}
    </frame>
    <frame posn="${this.positionX - this.margin} ${this.positionY - (this.headerHeight)} 1">
      <format textsize="1"/>
      ${this.constructText(login)}
    </frame>
    </manialink>`, login)
  }

  private constructHeader(): string {
    if (this.bestFinishes.length === 0) { return '' }
    return `
    <quad posn="0 0 1" sizen="${this.squareW} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
    <quad posn="${this.iconHPadding} ${-this.iconVPadding} 4" sizen="${this.iconW} ${this.iconH}" image="${this.icon}"/> 
    <frame posn="${this.squareW + this.margin} 0 1">
      <quad posn="0 0 1" sizen="${this.width - (this.squareW + this.margin)} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
       ${verticallyCenteredText(this.title, this.width - (this.squareW + this.margin), this.headerHeight, { textScale: CONFIG.staticHeader.textScale })}
    </frame>`
  }

  private constructText(login: string): string {
    // bestFinishes[i] can be undefined if someone was driving while controller was off (first indexes dont exist) so im just returning empty cells

    const indexCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.headerBg}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg + (centeredText((i + 1).toString(), w, h, { textScale: this.textScale, padding: this.textPadding }))
    }

    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.bg}"/>`
      const fin = this.bestFinishes[i]
      if (fin === undefined) { return '' }
      let format = fin.login === login ? `<format textcolor="${this.selfColour}"/>` : ''
      if (i === this.newestFinish) { format = `<format textcolor="${this.newestColour}"/>` }
      return bg + format + centeredText(TM.Utils.getTimeString(fin.time), w, h, { textScale: this.textScale, padding: this.textPadding })
    }

    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.bg}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg + (this.bestFinishes[i] === undefined ? '' : verticallyCenteredText(TM.strip(this.bestFinishes[i].nickname, false), w, h, { textScale: this.textScale, padding: this.textPadding }))
    }

    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    for (let i = 0; i < this.bestFinishes.length; i++) {
      arr.push(indexCell, timeCell, nicknameCell)
    }
    return this.grid.constructXml(arr)
  }

}

