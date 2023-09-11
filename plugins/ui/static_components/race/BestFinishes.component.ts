/**
 * @author lythx
 * @since 0.1
 */

import { componentIds, Grid, centeredText, leftAlignedText, StaticHeader, StaticComponent } from '../../UI.js'
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
    super(componentIds.bestFinishes)
    this.header = new StaticHeader('race')
    this.headerBg = this.header.options.textBackground
    this.headerHeight = this.header.options.height
    this.contentHeight = ((config.entryHeight + config.margin * 2) * config.entries) - (this.headerHeight + config.margin)
    this.grid = new Grid(config.width + config.margin * 2, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), { margin: config.margin })
    this.renderOnEvent('PlayerFinish', (info: tm.FinishInfo) => {
      let index: number = this.bestFinishes.findIndex(a => a.time > info.time)
      if (index === -1) { index = this.bestFinishes.length }
      if (index < config.entries) {
        this.bestFinishes.splice(index, 0, { login: info.login, time: info.time, nickname: info.nickname })
        this.bestFinishes.length = Math.min(config.entries, this.bestFinishes.length)
        this.newestFinish = index
        return this.display()
      }
    })
    this.renderOnEvent('PlayerDataUpdated', (info) => {
      for (const e of this.bestFinishes) {
        const newNickname: string | undefined = info.find(a => a.login === e.login)?.nickname
        if (newNickname !== undefined) { e.nickname = newNickname }
      }
      return this.display()
    })
    this.renderOnEvent('BeginMap', () => {
      this.newestFinish = -1
      this.bestFinishes.length = 0
      return this.display()
    })
  }

  getHeight(): number {
    return (config.entryHeight + config.margin * 2) * config.entries + StaticHeader.raceHeight + config.margin
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.reduxModeEnabled) { return this.displayToPlayer('')?.xml }
    const arr = []
    for (const e of tm.players.list) {
      arr.push(this.displayToPlayer(e.login))
    }
    return arr
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return {
      xml: `
    <manialink id="${this.id}">
    <frame posn="${config.posX} ${config.posY} 1">
      <format textsize="1"/>
      ${this.constructHeader()}
    </frame>
    <frame posn="${config.posX - config.margin} ${config.posY - (this.headerHeight)} 1">
      <format textsize="1"/>
      ${this.constructText(login)}
    </frame>
    </manialink>`, login
    }
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
    if (this.reduxModeEnabled) { login = '' }
    const indexCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.headerBg}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg + (centeredText((i + 1).toString(), w, h,
        { textScale: config.textScale, padding: config.textPadding }))
    }

    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}"/>`
      const fin = this.bestFinishes[i]
      if (fin === undefined) { return '' }
      let format: string = fin.login === login ? `<format textcolor="${config.selfColour}"/>` : ''
      if (i === this.newestFinish) { format = `<format textcolor="${config.newestColour}"/>` }
      return bg + format + centeredText(tm.utils.getTimeString(fin.time), w, h, { textScale: config.textScale, padding: config.textPadding })
    }

    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg +
        (leftAlignedText(tm.utils.strip(this.bestFinishes[i].nickname, false), w, h,
          { textScale: config.textScale, padding: config.textPadding }))
    }

    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    for (let i: number = 0; i < this.bestFinishes.length; i++) {
      arr.push(indexCell, timeCell, nicknameCell)
    }
    return this.grid.constructXml(arr)
  }

}
