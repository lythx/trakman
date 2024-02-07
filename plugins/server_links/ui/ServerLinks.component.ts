import config from './ServerLinks.config.js'
import { StaticComponent, StaticHeader, StaticHeaderOptions, componentIds, Grid, GridCellFunction, centeredText, leftAlignedText, Paginator } from '../../ui/UI.js'
import { ServerInfo } from '../ServerLinks.js'

export default class ServerLinks extends StaticComponent {

  private readonly paginator: Paginator
  private readonly header: StaticHeader
  private readonly grid: Grid
  private serverList: ServerInfo[] = []
  private readonly gameModeMap: { [gameMode in tm.GameMode]: string } = {
    TimeAttack: 'TA',
    Rounds: 'RND',
    Teams: 'TEAM',
    Cup: 'CUP',
    Laps: 'LAP',
    Stunts: 'STNT'
  }
  private readonly gameModeIcons: { [gameMode in tm.GameMode]: string } = config.icons.gameMode
  private currentDefaultPage = 0 // Gets incremented to 1 at first update
  private pageSwitchTimeouts: string[] = []

  constructor() {
    super(componentIds.serverLinks)
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width,
      config.height - this.header.options.height,
      [1], new Array(config.entries).fill(1))
    this.paginator = new Paginator(this.id, 0, 0, 4)
    this.paginator.onPageChange = (login) => {
      const obj = this.displayToPlayer(login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    }
    this.onPanelHide((player) => {
      this.sendMultipleManialinks(this.displayToPlayer(player.login))
    })
  }

  getHeight(): number {
    return config.height
  }

  update(newList: ServerInfo[]) {
    this.serverList = newList
    this.paginator.setPageCount(Math.ceil(this.serverList.length / config.entries))
    this.currentDefaultPage++
    if (this.currentDefaultPage > this.paginator.pageCount) {
      this.currentDefaultPage = 1
    }
    for (const e of tm.players.list) {
      if (this.pageSwitchTimeouts.some(a => a === e.login)) {
        this.pageSwitchTimeouts = this.pageSwitchTimeouts.filter(a => a !== e.login)
      } else {
        this.paginator.setPageForLogin(e.login, this.currentDefaultPage)
      }
    }
    this.sendMultipleManialinks(this.display())
  }

  display() {
    if (!this.isDisplayed) { return }
    const arr = []
    for (const player of tm.players.list) {
      arr.push(this.displayToPlayer(player.login))
    }
    return arr
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    if (config.hidePanel && this.hasPanelsHidden(login)) {
      return this.hideToPlayer(login)
    }
    const page: number = this.paginator.getPageByLogin(login)
    const pageCount: number = this.paginator.pageCount
    const functions: GridCellFunction[] = []
    const startIndex = (page - 1) * config.entries
    for (let i = 0; i < config.entries && this.serverList.length !== 0; i++) {
      functions.push((i, j, w, h) => this.constructEntry(i, j, w, h, startIndex))
    }
    return {
      xml: `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
          ${this.constructHeader(page, pageCount)}
        <frame posn="0 ${-this.header.options.height} 1">
          ${this.grid.constructXml(functions)}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

  private constructHeader(page: number, pageCount: number): string {
    let icons: (string | undefined)[] = [config.icons.prevPage, config.icons.nextPage]
    let iconsHover: (string | undefined)[] = [config.icons.prevPageHover, config.icons.nextPageHover]
    let ids: (number | undefined)[] = [this.paginator.ids[0], this.paginator.ids[1]]
    let buttonAmount: number = 2
    if (page === 1) {
      ids = [undefined, this.paginator.ids[1]]
      icons = [undefined, config.icons.nextPage]
      iconsHover = [undefined, config.icons.nextPageHover]
    } else if (page === pageCount) {
      icons = [config.icons.prevPage]
      iconsHover = [config.icons.prevPageHover]
      ids = [this.paginator.ids[0]]
    }
    if (pageCount === 1) {
      buttonAmount = 0
    }
    const headerCfg: StaticHeaderOptions = this.header.options
    let buttonsXml: string = ''
    for (let i: number = 0; i < buttonAmount; i++) {
      const action: string = ids[i] === undefined ? '' : `action="${ids[i]}"`
      const icon: string = icons[i] === undefined ? '' : `<quad posn="${headerCfg.iconHorizontalPadding} ${-headerCfg.iconVerticalPadding} 4" 
      sizen="${headerCfg.iconWidth} ${headerCfg.iconHeight}" image="${icons[i]}" imagefocus="${iconsHover[i]}" ${action}/>`
      buttonsXml += `<frame posn="${(config.width + config.margin) - (headerCfg.squareWidth + config.margin) * ((buttonAmount - i))} 0 1">
        <quad posn="0 0 1" sizen="${headerCfg.squareWidth} ${headerCfg.height}" bgcolor="${headerCfg.textBackground}"/>
        ${icon}
      </frame>`
    }
    return `<quad posn="0 0 1" sizen="${headerCfg.squareWidth} ${headerCfg.height}" bgcolor="${headerCfg.textBackground}"/>
    <quad posn="${headerCfg.iconHorizontalPadding} ${-headerCfg.iconVerticalPadding} 4" sizen="${headerCfg.iconWidth} ${headerCfg.iconHeight}" image="${config.icon}"/> 
    <frame posn="${headerCfg.squareWidth + config.margin} 0 1">
    <quad posn="0 0 1" sizen="${config.width - (headerCfg.squareWidth + config.margin) * (1 + buttonAmount)} ${headerCfg.height}" bgcolor="${headerCfg.textBackground}"/>
      ${leftAlignedText(config.title, config.width - (headerCfg.squareWidth + config.margin) * (1 + buttonAmount), headerCfg.height, { textScale: headerCfg.textScale, padding: headerCfg.horizontalPadding })}
    </frame>
    ${buttonsXml}
    `
  }

  private constructEntry(ii: number, jj: number, ww: number, hh: number, startIndex: number): string {
    const data = this.serverList[(ii + startIndex) % this.serverList.length]
    const m = config.margin
    const arr: GridCellFunction[] = [
      (i, j, w, h): string => {
        return `${this.icon(icons.name, iw, h)}
        ${this.text(tm.utils.strip(data.name, false), w - iw - m, h, iw + m, config.iconBackground, true)}`
      },
      (i, j, w, h): string => {
        const width = 7
        return `${this.icon(icons.map, iw, h)}
        ${this.text(data.currentMap, width, h, iw + m)}
        ${this.icon(icons.playerCount, iw, h, iw + width + 2 * m)}
        ${this.text(`${data.playerCount}/${data.maxPlayerCount}`, w - (2 * iw + width + 3 * m), h, 2 * iw + width + 3 * m)}`
      },
      (i, j, w, h): string => {
        const width = 7
        return `${this.icon(icons.author, iw, h)}
        ${this.text(data.currentMapAuthor, width, h, iw + m)}
        ${this.icon(this.gameModeIcons[data.gameMode], iw, h, iw + width + 2 * m)}
        ${this.text(this.gameModeMap[data.gameMode], w - (2 * iw + width + 3 * m), h, 2 * iw + width + 3 * m)}`
      }
    ]
    const iw = config.iconWidth
    const icons = config.icons
    const grid = new Grid(ww + config.margin * 2, hh + config.margin, [1], new Array(3).fill(1), { margin: config.margin })
    return `<frame posn="${-config.margin} 0 2">${grid.constructXml(arr)}</frame>`
  }

  private icon(url: string, w: number, h: number, xOffset: number = 0): string {
    return `<quad posn="${xOffset} 0 3" sizen="${w} ${h}" bgcolor="${config.iconBackground}"/>
    <quad posn="${config.margin + xOffset} ${-config.margin} 4" sizen="${w - config.margin * 2} ${h - config.margin * 2}" 
     image="${url}"/>`
  }

  private text(text: string, w: number, h: number, xOffset: number = 0, background?: string, leftAligned?: boolean): string {
    xOffset = xOffset ?? 0
    return `<quad posn="${xOffset ?? 0} 0 2" sizen="${w} ${h}" bgcolor="${background ?? config.textBackground}"/>
    ${leftAligned ? leftAlignedText(text, w, h,
      { textScale: config.textScale, padding: config.textPadding, xOffset: xOffset + config.margin, })
        : centeredText(text, w, h, { textScale: config.textScale, padding: config.textPadding, xOffset })}`
  }

}
