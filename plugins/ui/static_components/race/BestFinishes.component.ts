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
  private readonly grid: Grid
  private newestFinish: number = -1

  constructor() {
    super(componentIds.bestFinishes)
    this.header = new StaticHeader('race')
    this.headerBg = this.header.options.textBackground
    this.headerHeight = this.header.options.height
    if (config.horizontal) {
      this.grid = new Grid(config.horizontalModeWidth, config.entryHeight, new Array(config.entries).fill(config.columnProportions).flat(),
        [1], { margin: config.margin })
    } else {
      const contentHeight = ((config.entryHeight + config.margin * 2) * config.entries) - (this.headerHeight + config.margin)
      this.grid = new Grid(config.width + config.margin * 2, contentHeight, config.columnProportions,
        new Array(config.entries).fill(1), { margin: config.margin })
    }
    this.renderOnEvent('PlayerFinish', (info: tm.FinishInfo) => {
      const isStunts = tm.getGameMode() === 'Stunts'
      let index: number
      if (isStunts) {
        index = this.bestFinishes.findIndex(a => a.time < info.time)
      } else {
        index = this.bestFinishes.findIndex(a => a.time > info.time)
      }
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
    this.onPanelHide((player) => {
      this.sendMultipleManialinks(this.displayToPlayer(player.login))
    })
  }

  getHeight(): number {
    if (config.horizontal) {
      return config.entryHeight
    }
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
    if (config.hidePanel && this.hasPanelsHidden(login)) {
      return this.hideToPlayer(login)
    }
    if (config.horizontal) {
      return {
        xml: `
    <manialink id="${this.id}">
    <frame posn="${config.horizontalModePosX} ${config.posY + config.margin} 1">
      <format textsize="1"/>
      ${this.constructGrid(login)}
    </frame>
    </manialink>`,
        login
      }
    }
    return {
      xml: `
    <manialink id="${this.id}">
    <frame posn="${config.posX} ${config.posY} 1">
      <format textsize="1"/>
      ${this.constructHeader()}
    </frame>
    <frame posn="${config.posX - config.margin} ${config.posY - (this.headerHeight)} 1">
      <format textsize="1"/>
      ${this.constructGrid(login)}
    </frame>
    </manialink>`, login
    }
  }

  private constructHeader(): string {
    if (this.bestFinishes.length === 0) { return '' }
    return this.header.constructXml(config.title, config.icon, config.side)
  }

  private constructGrid(login: string): string {
    if (this.reduxModeEnabled) { login = '' }
    const indexCell = (i: number, j: number, w: number, h: number): string => {
      let index
      if (config.horizontal) {
        index = j / 3 + 1
      } else {
        index = i + 1
      }
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${this.headerBg}"/>`
      return this.bestFinishes[i] === undefined ? '' : bg + (centeredText((index).toString(), w, h,
        { textScale: config.textScale, padding: config.textPadding }))
    }

    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const index = config.horizontal ? (j - 1) / 3 : i
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}"/>`
      const fin = this.bestFinishes[index]
      if (fin === undefined) { return '' }
      let format: string = fin.login === login ? `<format textcolor="${config.selfColour}"/>` : ''
      if (index === this.newestFinish) { format = `<format textcolor="${config.newestColour}"/>` }
      return bg + format + centeredText(tm.utils.getTimeString(fin.time), w, h, { textScale: config.textScale, padding: config.textPadding })
    }

    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      const index = config.horizontal ? (j - 2) / 3 : i
      const bg = `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}"/>`
      return this.bestFinishes[index] === undefined ? '' : bg +
        (leftAlignedText(tm.utils.safeString(tm.utils.strip(this.bestFinishes[index].nickname, false)), w, h,
          { textScale: config.textScale, padding: config.textPadding }))
    }

    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    for (let i: number = 0; i < this.bestFinishes.length; i++) {
      arr.push(indexCell, timeCell, nicknameCell)
    }
    return this.grid.constructXml(arr)
  }

}
