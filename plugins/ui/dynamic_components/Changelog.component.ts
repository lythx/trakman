/**
 * @author lythx
 * @since 0.3
 */

import { Grid, componentIds, type GridCellFunction, centeredText, closeButton, PopupWindow, Paginator } from '../UI.js'
import config from './Changelog.config.js'
import fs from 'fs/promises'

export default class Changelog extends PopupWindow<{ page: number }> {

  private readonly versions: {
    version: string
    date: string
    content: string
  }[] = []
  private readonly paginator: Paginator
  private readonly grid: Grid

  constructor() {
    super(componentIds.changelog, config.icon, config.title, config.navbar)
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info) => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: config.command.privilege
    })
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, 1, 1)
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, { page }, `${page}/${this.paginator.pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.entries).fill(1), [1], { margin: config.marginBig })
    this.readChangelog()
  }

  private async readChangelog() {
    const file: Buffer | Error = await fs.readFile('./CHANGELOG.md').catch(err => err)
    if (file instanceof Error) {
      tm.log.warn(`Can't read CHANGELOG.md file`)
      return
    }
    const split = file.toString().split('## ')
    for (let i = split.length - 1; i > 0; i--) {
      const lines = split[i].split('\n')
      const version = lines[0].trim()
      const date = lines[1].split('**')[1]
      const content = lines.map(a => {
        if (a.length > config.lineCharacterLimit) {
          a = a.slice(0, config.lineCharacterLimit)
          return a.split(' ').slice(0, -1).join(' ') + '...'
        } else {
          return a
        }
      }).slice(2, 2 + config.lineCount).join('\n')
      if (![version, date, content].includes(undefined as any)) {
        this.versions.push({ version, date, content })
      }
    }
    this.paginator.setPageCount(Math.ceil(this.versions.length / config.entries))
    this.paginator.defaultPage = this.paginator.pageCount
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page }, `${page}/${this.paginator.pageCount}`)
  }

  protected constructContent(login: string, { page }: { page: number }): string {
    const index = config.entries * (page - 1)
    const cells: GridCellFunction[] = []
    const cell: GridCellFunction = (i, j, w, h) => {
      const el = this.versions[j + index]
      return this.constructEntry(el.version, el.date, el.content, w, h)
    }
    for (let i = 0; i < Math.min(config.entries, this.versions.length - index); i++) {
      cells.push(cell)
    }
    return this.grid.constructXml(cells)
  }

  private constructEntry(title: string, date: string, text: string, w: number, h: number) {
    const versionWidth = config.versionWidth
    const headerH = config.headerHeight
    const dateW = w - (versionWidth + this.margin)
    return `<format textsize="1"/>
      <quad posn="0 0 3" sizen="${versionWidth} ${headerH}" bgcolor="${this.headerBackground}"/>
      ${centeredText(`$s$${tm.utils.palette.green}${title}`, versionWidth, headerH, { padding: this.margin, textScale: config.textScale })}
      <frame posn="${versionWidth + this.margin} 0 2">
        <quad posn="0 0 2" sizen="${dateW} ${headerH}" bgcolor="${this.headerBackground}"/>
        ${centeredText(`$s${date}`, dateW, headerH, { padding: this.margin, textScale: config.textScale })}
      </frame>
      <frame posn="0 ${-headerH - this.margin} 2">
        <quad posn="0 0 2" sizen="${w} ${h - (headerH + this.margin)}" bgcolor="${config.tileBackground}"/>
        <label posn="${config.marginBig} ${-config.marginBig} 5" 
        sizen="${w - config.marginBig * 2} ${h - (headerH + this.margin + config.marginBig * 2)}" 
        scale="1.15" text="$s${tm.utils.safeString(text)}"/>
      </frame>`
  }

  protected constructFooter(login: string, { page }: { page: number }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(page)
  }

}