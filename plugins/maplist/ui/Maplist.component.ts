/**
 * @author lythx
 * @since 0.1
 */

import { centeredText, closeButton, Grid, componentIds, leftAlignedText, addManialinkListener, PopupWindow, Paginator } from '../../ui/UI.js'
import { actions } from '../../actions/Actions.js'
import { maplist } from '../Maplist.js'
import config from './Maplist.config.js'

export default class MapList extends PopupWindow<{ page: number, paginator: Paginator, list?: readonly tm.Map[] }> {

  private readonly paginator: Paginator
  private readonly mapAddId: number = 1000
  private readonly maxMapCount = 1_000_000
  private readonly grid: Grid
  private readonly mapActionIds: string[] = []
  private readonly playerQueries: { paginator: Paginator, list: readonly tm.Map[], login: string, query?: string }[] = []
  private readonly paginatorIdOffset: number = this.mapAddId + this.maxMapCount
  private readonly mapDeleteId: number = this.mapAddId + this.maxMapCount * 2
  private readonly displayEnvironment: boolean = config.displayEnvironment !== undefined ? config.displayEnvironment : process.env.SERVER_PACKMASK !== "nations"
  private nextPaginatorId = 0

  constructor() {
    super(componentIds.mapList, config.icon, config.title, config.navbar)
    const pageCount: number = Math.ceil(tm.maps.count / (config.rows * config.columns))
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, pageCount)
    this.paginator.onPageChange = (login: string, page: number): void => {
      let pageCount: number = Math.ceil(tm.maps.count / (config.rows * config.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.setPageCount(pageCount)
      this.displayToPlayer(login, { page, paginator: this.paginator }, `${page}/${pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.columns).fill(1),
      new Array(config.rows).fill(1), config.grid)
    addManialinkListener(this.openId + this.mapAddId, this.maxMapCount, (info, mapIndex): void => {
      const mapId: string = this.mapActionIds[mapIndex]
      if (mapId === undefined) {
        tm.sendMessage(config.messages.error, info.login)
        tm.log.error('Error while adding map to queue from jukebox', `Map index out of range`)
        return
      }
      const gotQueued: boolean = this.handleMapClick(mapId, info.login, info.nickname, info.privilege)
      if (!gotQueued) { return }
      this.reRender()
    })
    addManialinkListener(this.openId + this.mapDeleteId, this.maxMapCount, async (info, mapIndex): Promise<void> => {
      const mapId: string = this.mapActionIds[mapIndex]
      if (mapId === undefined) {
        tm.sendMessage(config.messages.error, info.login)
        tm.log.error('Error while removing map', `Map index out of range`)
        return
      }
      await actions.removeMap(info.login, info.nickname, info.title, mapId)
      this.reRender()
    })
    addManialinkListener(componentIds.jukebox, (info): Promise<void> => this.openWithOption(info.login, 'jukebox', 1))
    tm.commands.add({
      aliases: config.commands.list.aliases,
      help: config.commands.list.help,
      params: [{ name: 'query', optional: true, type: 'multiword' }],
      callback: (info: tm.MessageInfo, query?: string): void => {
        if (query === undefined) {
          tm.openManialink(this.openId, info.login)
          return
        }
        const split = query.split(' ').filter(a => a != '')
        const [q1, q2] = [split[0], split[1]]
        let page = 1
        if (q1 !== undefined && q1.startsWith(config.pageSearchSeparator)) {
          page = Number(q1.slice(2))
          if (!Number.isInteger(page) || page < 1) {
            page = 1
          }
          void this.openOnPage(info.login, page)
          return
        }
        if (q2 !== undefined && q2.startsWith(config.pageSearchSeparator)) {
          page = Number(q2.slice(2))
          if (!Number.isInteger(page) || page < 1) {
            page = 1
          }
          query = q1
        }
        if (query === 'jb') { query = 'jukebox' }
        const option: string = query.split(' ').filter(a => a !== '')[0]
        const arr = ['jukebox', 'name', 'karma', 'short', 'long', 'best', 'worst', 'worstkarma', 'oldest', 'newest'] as const
        const o = arr.find(a => a === option)
        if (o !== undefined) {
          void this.openWithOption(info.login, o, page)
          return
        }
        if (['nofin', 'nofinish'].includes(option)) {
          void this.openWithOption(info.login, 'nofinish', page)
        } else if (option === 'noauthor') {
          void this.openWithOption(info.login, 'noauthor', page)
        } else if (option === 'norank') {
          void this.openWithOption(info.login, 'norank', page)
        } else if (query.startsWith(config.authorSearchSeparator)) {
          void this.openWithQuery(info.login, query.slice(config.authorSearchSeparator.length), page, true)
        } else {
          void this.openWithQuery(info.login, query, page)
        }
      },
      privilege: config.commands.list.privilege
    },
      {
        aliases: config.commands.best.aliases,
        help: config.commands.best.help,
        params: [{ name: 'page', type: 'int', optional: true }],
        callback: (info: tm.MessageInfo, page?: number): void => {
          this.openWithOption(info.login, 'best', page ?? 1)
        },
        privilege: config.commands.best.privilege
      },
      {
        aliases: config.commands.worst.aliases,
        help: config.commands.worst.help,
        params: [{ name: 'page', type: 'int', optional: true }],
        callback: (info: tm.MessageInfo, page?: number): void => {
          this.openWithOption(info.login, 'worst', page ?? 1)
        },
        privilege: config.commands.worst.privilege
      },
      {
        aliases: config.commands.jukebox.aliases,
        help: config.commands.jukebox.help,
        params: [{ name: 'page', type: 'int', optional: true }],
        callback: (info: tm.MessageInfo, page?: number): void => {
          this.openWithOption(info.login, 'jukebox', page ?? 1)
        },
        privilege: config.commands.jukebox.privilege
      }
    )
    maplist.onListUpdate((): void => this.reRender())
    maplist.onJukeboxUpdate((): void => this.reRender())
  }

  async openWithOption(login: string, option: 'jukebox' | 'name' | 'karma'
    | 'short' | 'long' | 'best' | 'worst' | 'worstkarma' | 'nofinish'
    | 'norank' | 'noauthor' | 'oldest' | 'newest', page: number): Promise<void> {
    let list: readonly Readonly<tm.Map>[] = []
    if (option === 'best' || option === 'worst') {
      list = maplist.getByPosition(login, option)
    } else if (option === 'nofinish' || option === 'norank' || option === 'noauthor') {
      list = await maplist.getFiltered(login, option)
    } else {
      list = maplist.get(option)
    }
    const paginator = this.getPaginator(login, list, option)
    page = Math.max(1, Math.min(Math.ceil(list.length / (config.rows * config.columns)), page))
    paginator.setPageForLogin(login, page)
    this.displayToPlayer(login, { page, paginator, list }, `${page}/${paginator.pageCount}`,
      undefined, config.optionTitles[option as keyof typeof config.optionTitles])
  }

  openWithQuery(login: string, query: string, page: number, searchByAuthor?: true): void {
    const list: Readonly<tm.Map>[] = searchByAuthor === true ? maplist.searchByAuthor(query) : maplist.searchByName(query)
    const paginator = this.getPaginator(login, list, query)
    page = Math.max(1, Math.min(Math.ceil(list.length / (config.rows * config.columns)), page))
    paginator.setPageForLogin(login, page)
    this.displayToPlayer(login, { page, paginator, list }, `${page}/${paginator.pageCount}`)
  }

  openOnPage(login: string, page: number): void {
    const list: Readonly<tm.Map>[] = tm.maps.list
    const paginator = this.paginator
    page = Math.min(Math.ceil(list.length / (config.rows * config.columns)), page)
    paginator.setPageForLogin(login, page)
    this.displayToPlayer(login, { page, paginator, list }, `${page}/${paginator.pageCount}`)
  }

  private getPaginator(login: string, list: readonly tm.Map[], option: string): Paginator {
    const pageCount: number = Math.ceil(list.length / (config.rows * config.columns))
    const playerQuery = this.playerQueries.find(a => a.login === login)
    let paginator: Paginator
    if (playerQuery !== undefined) {
      playerQuery.list = list
      paginator = playerQuery.paginator
      paginator.setPageForLogin(login, 1)
      paginator.onPageChange = (login: string, page: number): Promise<void> => this.displayToPlayer(login,
        { page, paginator, list }, `${page}/${pageCount}`, undefined,
        config.optionTitles[option as keyof typeof config.optionTitles])
      paginator.setPageCount(pageCount)
    } else {
      paginator = new Paginator(this.openId + this.paginatorIdOffset + this.nextPaginatorId,
        this.windowWidth, this.footerHeight, pageCount)
      this.nextPaginatorId += 10
      this.nextPaginatorId = this.nextPaginatorId % 3000
      this.playerQueries.push({ paginator, login, list, query: option })
      paginator.onPageChange = (login: string, page: number): Promise<void> => this.displayToPlayer(login,
        { page, paginator, list }, `${page}/${pageCount}`, undefined,
        config.optionTitles[option as keyof typeof config.optionTitles])
    }
    return paginator
  }

  private reRender(): void {
    const players: string[] = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const obj = this.playerQueries.find(a => a.login === login)
      let paginator = this.paginator
      let list: readonly Readonly<tm.Map>[] = maplist.get()
      let query: string | undefined
      if (obj !== undefined) {
        paginator = obj.paginator
        list = obj.list
        query = obj.query
      }
      const page: number = paginator.getPageByLogin(login)
      let pageCount: number = Math.ceil(list.length / (config.rows * config.columns))
      if (pageCount === 0) { pageCount++ }
      if (page === undefined) {
        this.displayToPlayer(login, { page: 1, paginator, list }, `1/${pageCount}`, undefined, query)
        return
      }
      this.displayToPlayer(login, { page, paginator, list }, `${page}/${pageCount}`, undefined, query)
    }
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page: number = this.paginator.getPageByLogin(info.login)
    let pageCount: number = Math.ceil(tm.maps.count / (config.rows * config.columns))
    if (pageCount === 0) { pageCount++ }
    if (page === undefined || page > pageCount) {
      this.displayToPlayer(info.login, { page: 1, paginator: this.paginator }, `1/${pageCount}`)
      return
    }
    this.paginator.setPageCount(pageCount)
    const index: number = this.playerQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.playerQueries[index].paginator.destroy()
      this.playerQueries.splice(index, 1)
    }
    this.displayToPlayer(info.login, { page, paginator: this.paginator }, `${page}/${pageCount}`)
  }

  protected onClose(info: tm.ManialinkClickInfo): void {
    const index: number = this.playerQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.playerQueries[index].paginator.destroy()
      this.playerQueries.splice(index, 1)
    }
    this.hideToPlayer(info.login)
  }

  protected async constructContent(login: string, params?: { page: number, list?: readonly tm.Map[] }): Promise<string> {
    const maps: readonly Readonly<tm.Map>[] = params?.list ?? maplist.get()
    const startIndex: number = (config.rows * config.columns) * ((params?.page ?? 1) - 1)
    const recordIndexStrings: string[] = await this.getRecordIndexStrings(login, ...maps.slice(startIndex,
      (config.rows * config.columns) + startIndex).map(a => a.id))
    const mapsToDisplay: number = Math.min(maps.length - startIndex, config.rows * config.columns)
    const cell = (i: number, j: number, w: number, h: number): string => {
      const gridIndex: number = (i * config.columns) + j
      const recordIndexString: string = recordIndexStrings[gridIndex]
      const index: number = startIndex + gridIndex
      const { actionId, deleteId } = this.getActionAndDeleteId(maps[index].id)
      const header: string = this.getHeader(login, index, maps[index].id, actionId, deleteId, w, h)
      const rowH: number = (h - this.margin) / 4
      const width: number = (w - this.margin * 3) - config.iconWidth
      const karmaW: number = width - (config.timeWidth + config.positionWidth + this.margin * 4 + config.iconWidth * 2)
      return `
        <frame posn="${this.margin} ${-this.margin} 3">
          <format textsize="1"/>
          ${header}
          <frame posn="0 ${-rowH} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4"
             sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" image="${config.icons[1]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${leftAlignedText(tm.utils.safeString(tm.utils.strip(tm.utils.decodeURI(maps[index].name), false)), width,
        rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 2} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" 
             sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" image="${config.icons[2]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${leftAlignedText(tm.utils.safeString(maps[index].author), width, rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" 
             image="${config.icons[3]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${config.timeWidth} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(tm.utils.getTimeString(maps[index].authorTime), config.timeWidth, rowH - this.margin,
          { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
          <frame posn="${config.timeWidth + config.iconWidth + this.margin * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" 
             image="${config.icons[4]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${config.positionWidth} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(` ${recordIndexString} `, config.positionWidth, rowH - this.margin, { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
          <frame posn="${config.timeWidth + config.positionWidth + this.margin * 4 + config.iconWidth * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}"
             image="${config.icons[this.displayEnvironment ? 8 : 5]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${karmaW} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(this.displayEnvironment ? (maps[index].environment === 'Stadium' ? 'Stad' : maps[index].environment) : maps[index].voteRatio === -1 ? config.defaultText : maps[index].voteRatio.toFixed(0), karmaW,
            rowH - this.margin, { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
        </frame>`
    }
    return this.grid.constructXml(new Array(mapsToDisplay).fill(cell))
  }

  protected constructFooter(login: string, params?: { paginator: Paginator }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + (params?.paginator ?? this.paginator).constructXml(login)
  }

  private handleMapClick(mapId: string, login: string, nickname: string, privilege: number): boolean {
    const map: Readonly<tm.Map> | undefined = maplist.get().find(a => a.id === mapId)
    if (map === undefined) {
      tm.sendMessage(config.messages.error, login)
      tm.log.error('Error while adding map to queue from jukebox', `Can't find map with id ${mapId} in memory`)
      return false
    }
    if (tm.jukebox.juked.some(a => a.map.id === mapId)) {
      tm.jukebox.remove(mapId, { login, nickname })
      tm.sendMessage(tm.utils.strVar(config.messages.remove,
        { player: tm.utils.strip(nickname, true), map: tm.utils.strip(tm.utils.decodeURI(map.name), true) }), config.public ? undefined : login)
    }
    else {
      if ((privilege < config.multijukePrivilege && tm.jukebox.juked.some(a => a.callerLogin === login))
        || (config.multijukeMaxMaps - 1 < tm.jukebox.juked.filter(a => a.callerLogin === login).length && privilege < config.unlimitedJukePrivilege)) {
        tm.sendMessage(config.messages.noPermission, login)
        return false
      }
      tm.jukebox.add(mapId, { login, nickname })
      tm.sendMessage(tm.utils.strVar(config.messages.add,
        { player: tm.utils.strip(nickname, true), map: tm.utils.strip(tm.utils.decodeURI(map.name), true) }), config.public ? undefined : login)
    }
    return true
  }

  private async getRecordIndexStrings(login: string, ...mapIds: string[]): Promise<string[]> {
    const ranks = tm.records.getRank(login, mapIds)
    const ret: string[] = []
    for (let i = 0; i < mapIds.length; i++) {
      const r = ranks.find(a => a.mapId === mapIds[i])
      if (r === undefined) { ret.push(config.texts.noRank) }
      else { ret.push(tm.utils.getOrdinalSuffix(r.rank)) }
    }
    return ret
  }

  private getActionAndDeleteId(mapId: string): { actionId: number, deleteId: number } {
    let actionId = -1
    let deleteId = -1
    const mapActionId: number = this.mapActionIds.indexOf(mapId)
    if (mapActionId !== -1) {
      actionId = mapActionId + this.openId + this.mapAddId
      deleteId = mapActionId + this.openId + this.mapDeleteId
    }
    else {
      this.mapActionIds.push(mapId)
      actionId = this.mapActionIds.length + this.openId + this.mapAddId - 1
      deleteId = this.mapActionIds.length + this.openId + this.mapDeleteId - 1
    }
    return { actionId, deleteId }
  }

  private getHeader(login: string, mapIndex: number, mapId: string, actionId: number, deleteId: number, w: number, h: number): string {
    const height: number = h - this.margin
    const index: number = tm.jukebox.juked.findIndex(a => a.map.id === mapId)
    const prevIndex: number = [tm.maps.current, ...tm.jukebox.history].findIndex(a => a.id === mapId)
    const player = tm.players.get(login)
    if (player === undefined) { return '' }
    let overlay: string | undefined
    if (player?.privilege < 1
      && (prevIndex !== -1 || (tm.jukebox.juked[index]?.callerLogin !== undefined && tm.jukebox.juked[index].callerLogin !== login))) {
      overlay = `<quad posn="0 0 8" sizen="${w} ${h}" bgcolor="${config.overlayBackground}"/>
        <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>`
    }
    let width = (w - this.margin * 3) - config.iconWidth
    if (index !== -1) {
      return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${config.blankImage}" 
            imagefocus="${config.minusImage}"/>`}
          <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${config.icons[0]}"/>
          <frame posn="${config.iconWidth + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width - (this.margin * 2 + config.queueWidth + config.queueNumberWidth)} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${leftAlignedText(`${config.texts.map}${mapIndex + 1}`, width - (this.margin * 2 + config.queueWidth) + config.queueNumberWidth, height / 4 - this.margin, { textScale: config.textScale })}
          </frame>
          <frame posn="${config.iconWidth + width - (config.queueWidth + config.queueNumberWidth)} 0 1">
            <quad posn="0 0 3" sizen="${config.queueWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${centeredText(`$${config.colour}${config.texts.queued}`, config.queueWidth, height / 4 - this.margin, { padding: config.padding, textScale: config.textScale })}
          <frame posn="${config.queueWidth + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${config.queueNumberWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${centeredText(`$${config.colour}${tm.utils.getOrdinalSuffix(index + 1)}`, config.queueNumberWidth, height / 4 - this.margin, { padding: config.padding, textScale: config.textScale })}
          </frame>
          </frame>`
    }
    const deletePrivilege = tm.maps.current.id !== mapId && player.privilege >= config.removePrivilege
    if (deletePrivilege) {
      width = (w - this.margin * 4) - config.iconWidth * 2
    }
    const deleteButton = deletePrivilege ?
      `<frame posn="${config.iconWidth + this.margin * 2 + width} 0 1">
      <quad posn="0 0 7.9" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
      <quad posn="${this.margin} ${-this.margin} 8" sizen="${config.iconWidth - this.margin * 2} ${(height / 4) - this.margin * 3}" 
        image="${config.icons[6]}" imagefocus="${config.icons[7]}" action="${deleteId}"/>
      </frame>` : ``
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
          ${deleteButton}`
  }

}

tm.addListener('Startup', (): void => {
  new MapList()
})
