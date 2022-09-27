
import StaticComponent from '../../StaticComponent.js'
import { IDS, Grid, centeredText, verticallyCenteredText, StaticHeader } from '../../UiUtils.js'
import config from './BestFinishes.config.js'

export default class BestFinishes extends StaticComponent {

  private readonly bestFinishes: { login: string, time: number, nickname: string }[] = []
  private readonly header: StaticHeader
  private readonly headerBg: string
  private readonly headerHeight: number
  private readonly contentHeight: number
  private readonly grid: Grid
  private newestFinish: number = -1

  constructor() {
    super(IDS.bestFinishes, 'race')
    this.header = new StaticHeader('race')
    this.headerBg = this.header.options.textBackground
    this.headerHeight = this.header.options.height
    this.contentHeight = config.height - (config.margin + this.headerHeight)
    this.grid = new Grid(config.width + config.margin * 2, this.contentHeight + config.margin * 2, config.columnProportions,
      new Array(config.entries).fill(1), { margin: config.margin })
    tm.addListener('PlayerFinish', (info: FinishInfo) => {
      let index = this.bestFinishes.findIndex(a => a.time > info.time)
      if (index === -1) { index = this.bestFinishes.length }
      if (index < config.entries) {
        this.bestFinishes.splice(index, 0, { login: info.login, time: info.time, nickname: info.nickname })
        this.bestFinishes.length = Math.min(config.entries, this.bestFinishes.length)
        this.newestFinish = index
        this.display()
      }
    })
    tm.addListener('BeginMap', () => {
      this.newestFinish = -1
      this.bestFinishes.length = 0
      this.display()
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const e of tm.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(`
    <manialink id="${this.id}">
    <frame posn="${config.posX} ${config.posY} 1">
      <format textsize="1"/>
      ${this.constructHeader()}
    </frame>
    <frame posn="${config.posX - config.margin} ${config.posY - (this.headerHeight)} 1">
      <format textsize="1"/>
      ${this.constructText(login)}
    </frame>
    </manialink>`, login)
  }

  private constructHeader(): string {
    if (this.bestFinishes.length === 0) { return '' }
    return this.header.constructXml(config.title, config.icon, config.side)
    //  `
    // <quad posn="0 0 1" sizen="${this.squareW} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
    // <quad posn="${this.iconHPadding} ${-this.iconVPadding} 4" sizen="${this.iconW} ${this.iconH}" image="${config.icon}"/> 
    // <frame posn="${this.squareW + config.margin} 0 1">
    //   <quad posn="0 0 1" sizen="${config.width - (this.squareW + config.margin)} ${this.headerHeight}" bgcolor="${this.headerBg}"/>
    //    ${verticallyCenteredText(config.title, config.width - (this.squareW + config.margin), 
    //     this.headerHeight, { textScale: config.textScale })}
    // </frame>`
  }

  private constructText(login: string): string {

    const indexCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.headerBg}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg + (centeredText((i + 1).toString(), w, h,
        { textScale: config.textScale, padding: config.textPadding }))
    }

    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}"/>`
      const fin = this.bestFinishes[i]
      if (fin === undefined) { return '' }
      let format = fin.login === login ? `<format textcolor="${config.selfColour}"/>` : ''
      if (i === this.newestFinish) { format = `<format textcolor="${config.newestColour}"/>` }
      return bg + format + centeredText(tm.utils.getTimeString(fin.time), w, h, { textScale: config.textScale, padding: config.textPadding })
    }

    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg +
        (verticallyCenteredText(tm.utils.strip(this.bestFinishes[i].nickname, false), w, h,
          { textScale: config.textScale, padding: config.textPadding }))
    }

    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    for (let i = 0; i < this.bestFinishes.length; i++) {
      arr.push(indexCell, timeCell, nicknameCell)
    }
    return this.grid.constructXml(arr)
  }

}

