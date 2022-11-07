/**
 * @author lythx
 */

import { centeredText, closeButton, Grid, componentIds, leftAlignedText, addManialinkListener, PopupWindow } from '../UI.js'
import { Paginator } from "../UI.js"
import config from './TMXSearchWindow.config.js'

export default class TMXSearchWindow extends PopupWindow<{ page: number, paginator: Paginator, list: tm.TMXSearchResult[] }> {

  private readonly mapAddId = 1000
  private readonly grid: Grid
  private readonly mapActionIds: string[] = []
  private readonly playerQueries: { paginator: Paginator, list: tm.TMXSearchResult[], login: string }[] = []
  private readonly paginatorIdOffset = 7000
  private nextPaginatorId = 0
  private requestedMaps: string[] = []

  constructor() {
    super(componentIds.TMXSearchWindow, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.columns).fill(1),
      new Array(config.rows).fill(1), config.grid)
    addManialinkListener(this.openId + this.mapAddId, 5000, async (info, mapIndex) => {
      const mapId = this.mapActionIds[mapIndex]
      if (mapId === undefined) {
        tm.sendMessage(config.messages.error, info.login)
        tm.log.error('Error while adding map to queue TMX search window', `Map index out of range`)
        return
      }
      const gotQueued = await this.handleMapClick(mapId, info.login, info.nickname, info.privilege, info.title)
      if (gotQueued === false) { return }
    })
    tm.commands.add({
      aliases: ['xlist', 'searchtmx', 'searchmap'],
      help: 'Search for maps matching the specified name on TMX and display them in a window.',
      params: [{ name: 'query', optional: true, type: 'multiword' }],
      callback: async (info: tm.MessageInfo, query?: string): Promise<void> => {
        const maps = await tm.tmx.searchForMap(query)
        if (maps instanceof Error) {
          tm.sendMessage(config.messages.searchError)
          return
        }
        const paginator = this.getPaginator(info.login, maps)
        this.displayToPlayer(info.login, { page: 1, paginator, list: maps }, `1/${paginator.pageCount}`)
      },
      privilege: 0
    })
  }

  private getPaginator(login: string, list: tm.TMXSearchResult[]) {
    const pageCount = Math.ceil(list.length / (config.rows * config.columns))
    const playerQuery = this.playerQueries.find(a => a.login === login)
    let paginator: Paginator
    if (playerQuery !== undefined) {
      playerQuery.list = list
      paginator = playerQuery.paginator
      paginator.setPageForLogin(login, 1)
      paginator.onPageChange = (login: string, page: number) => this.displayToPlayer(login,
        { page, paginator, list }, `${page}/${pageCount}`)
      paginator.setPageCount(pageCount)
    } else {
      paginator = new Paginator(this.openId + this.paginatorIdOffset + this.nextPaginatorId,
        this.windowWidth, this.footerHeight, pageCount)
      this.nextPaginatorId += 10
      this.nextPaginatorId = this.nextPaginatorId % 3000
      this.playerQueries.push({ paginator, login, list })
      paginator.onPageChange = (login: string, page: number) => this.displayToPlayer(login,
        { page, paginator, list }, `${page}/${pageCount}`)
    }
    return paginator
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const obj = this.playerQueries.find(a => a.login === login)
      if (obj === undefined) { continue }
      this.displayToPlayer(login, { page: 1, paginator: obj.paginator, list: obj.list }, `1/${obj.paginator.pageCount}`)
    }
  }

  protected async onOpen(info: tm.ManialinkClickInfo): Promise<void> {
    const maps = await tm.tmx.searchForMap()
    if (maps instanceof Error) {
      tm.sendMessage(config.messages.searchError)
      return
    }
    const paginator = this.getPaginator(info.login, maps)
    this.displayToPlayer(info.login, { page: 1, paginator, list: maps }, `1/${paginator.pageCount}`)
  }

  protected onClose(info: tm.ManialinkClickInfo): void {
    const index = this.playerQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.playerQueries[index].paginator.destroy()
      this.playerQueries.splice(index, 1)
    }
    this.hideToPlayer(info.login)
  }

  private isMultiByte = (str: string) =>
    [...str].some(c => (c.codePointAt(0) ?? 0) > 255)

  protected async constructContent(login: string, params?: { page: number, list?: tm.TMXSearchResult[] }): Promise<string> {
    const maps = params?.list ?? []
    const startIndex = (config.rows * config.columns) * ((params?.page ?? 1) - 1)
    const mapsToDisplay = Math.min(maps.length - startIndex, config.rows * config.columns)
    const cell = (i: number, j: number, w: number, h: number) => {
      const gridIndex = (i * config.columns) + j
      const index = startIndex + gridIndex
      let name = tm.utils.safeString(tm.utils.strip(maps[index].name, false))
      let author = tm.utils.safeString(maps[index].author)
      if (this.isMultiByte(name)) {
        name = ''
      }
      if (this.isMultiByte(author)) {
        author = ''
      }
      const actionId = this.getActionId(maps[index].id)
      const header = this.getHeader(index, maps[index].id, actionId, w, h, maps[index].pageUrl)
      const rowH = (h - this.margin) / 4
      const width = (w - this.margin * 3) - config.iconWidth
      const dateW = width - (config.timeWidth + config.awardsWidth + this.margin * 4 + config.iconWidth * 2)
      return `
        <frame posn="${this.margin} ${-this.margin} 3">
          <format textsize="1"/>
          ${header}
          <frame posn="0 ${-rowH} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4"
             sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" image="${config.icons[2]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${leftAlignedText(name, width, rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 2} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" 
             sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" image="${config.icons[3]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${leftAlignedText(author, width, rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" 
             image="${config.icons[4]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${config.timeWidth} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(tm.utils.getTimeString(maps[index].authorTime), config.timeWidth, rowH - this.margin,
        { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
          <frame posn="${config.timeWidth + config.iconWidth + this.margin * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" 
             image="${config.icons[5]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${config.awardsWidth} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(maps[index].awards.toString(), config.awardsWidth, rowH - this.margin, { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
          <frame posn="${config.timeWidth + config.awardsWidth + this.margin * 4 + config.iconWidth * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}"
             image="${config.icons[6]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${dateW} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(tm.utils.formatDate(maps[index].uploadDate), dateW,
          rowH - this.margin, { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
        </frame>`
    }
    return this.grid.constructXml(new Array(mapsToDisplay).fill(cell))
  }

  protected constructFooter(login: string, params?: { paginator: Paginator }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + ((params === undefined) ? '' :
      (params.paginator).constructXml(login))
  }

  private async handleMapClick(mapId: string, login: string, nickname: string, privilege: number, title: string): Promise<boolean> {
    if (privilege < config.addPrivilege) { return false }
    this.requestedMaps.push(mapId)
    this.reRender()
    const map = await tm.tmx.fetchMapFile(mapId)
    if (map instanceof Error) {
      this.requestedMaps = this.requestedMaps.filter(a => a !== mapId)
      this.reRender()
      tm.sendMessage(config.messages.fetchError)
      return false
    }
    const status = await tm.maps.writeFileAndAdd(map.name, map.content, { login, nickname })
    if (status instanceof Error) {
      this.requestedMaps = this.requestedMaps.filter(a => a !== mapId)
      this.reRender()
      tm.sendMessage(config.messages.error)
      return false
    }
    if (status.wasAlreadyAdded === true) {
      tm.sendMessage(tm.utils.strVar(config.messages.alreadyAdded,
        { title, nickname: tm.utils.strip(nickname, true), map: tm.utils.strip(map.name.split('.Challenge.Gbx').slice(0, -1).join(), true) }),
        config.public === true ? undefined : login)
    } else {
      tm.sendMessage(tm.utils.strVar(config.messages.added,
        { title, nickname: tm.utils.strip(nickname, true), map: tm.utils.strip(map.name.split('.Challenge.Gbx').slice(0, -1).join(), true) }),
        config.public === true ? undefined : login)
    }
    this.requestedMaps = this.requestedMaps.filter(a => a !== mapId)
    this.reRender()
    return true
  }

  private getActionId(mapId: string): number {
    const mapActionId = this.mapActionIds.indexOf(mapId)
    if (mapActionId !== -1) { return mapActionId + this.openId + this.mapAddId }
    else {
      this.mapActionIds.push(mapId)
      return this.mapActionIds.length + this.openId + this.mapAddId - 1
    }
  }

  private getHeader(mapIndex: number, mapId: string, actionId: number, w: number, h: number, url: string): string {
    const width = (w - this.margin * 4) - config.iconWidth * 2
    const height = h - this.margin
    const isInMapList = (tm.maps.get(mapId) !== undefined) || this.requestedMaps.includes(mapId)
    let overlay: string | undefined
    if (isInMapList) {
      overlay = `<quad posn="0 0 8" sizen="${w} ${h}" bgcolor="${config.overlayBackground}"/>
      <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>`
    }
    return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${config.blankImage}" 
            imagefocus="${config.plusImage}"/>`}
          <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${(height / 4) - this.margin * 3}" 
           image="${config.icons[0]}"/>
          <frame posn="${config.iconWidth + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${leftAlignedText(`${config.texts.map}${mapIndex + 1}`, width, height / 4 - this.margin, { textScale: config.textScale })}
          </frame>
          <frame posn="${config.iconWidth + this.margin * 2 + width} 0 1">
            <quad posn="0 0 7.9" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 8" sizen="${config.iconWidth - this.margin * 2} ${(height / 4) - this.margin * 3}" 
             image="${config.icons[1]}" url="${url}"/>
          </frame>`
  }

} 
