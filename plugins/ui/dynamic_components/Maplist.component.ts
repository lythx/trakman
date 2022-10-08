import PopupWindow from "../PopupWindow.js"
import { centeredText, closeButton, Grid, IDS, verticallyCenteredText, addManialinkListener } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js"
import { maplist } from '../../maplist/Maplist.js'
import config from './Maplist.config.js'

export default class MapList extends PopupWindow<{ page: number, paginator: Paginator, list?: readonly tm.Map[] }> {

  private readonly paginator: Paginator
  private readonly mapAddId = 1000
  private readonly grid: Grid
  private readonly challengeActionIds: string[] = []
  private readonly playerQueries: { paginator: Paginator, list: readonly tm.Map[], login: string }[] = []
  private readonly paginatorIdOffset = 7000
  private nextPaginatorId = 0

  constructor() {
    super(IDS.mapList, config.icon, config.title, config.navbar)
    const pageCount = Math.ceil(tm.maps.count / (config.rows * config.columns))
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, pageCount)
    this.paginator.onPageChange = (login: string, page: number) => {
      let pageCount = Math.ceil(tm.maps.count / (config.rows * config.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.setPageCount(pageCount)
      this.displayToPlayer(login, { page, paginator: this.paginator }, `${page}/${pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.columns).fill(1),
      new Array(config.rows).fill(1), config.grid)
    addManialinkListener(this.openId + this.mapAddId, 5000, (info, mapIndex) => {
      const mapId = this.challengeActionIds[mapIndex]
      if (mapId === undefined) {
        tm.sendMessage(config.messages.error, info.login)
        tm.log.error('Error while adding map to queue from jukebox', `Map index out of range`)
        return
      }
      const gotQueued = this.handleMapClick(mapId, info.login, info.nickname, info.privilege)
      if (gotQueued === false) { return }
      this.reRender()
    })
    addManialinkListener(IDS.jukebox, (info) => this.openWithOption(info.login, 'jukebox'))
    tm.commands.add({
      aliases: ['l', 'ml', 'list'],
      help: 'Display list of maps. Start with $a to author search. Options: jukebox, jb, name, karma, short, long, best, worst, worstkarma.',
      params: [{ name: 'query', optional: true, type: 'multiword' }],
      callback: async (info: tm.MessageInfo, query?: string): Promise<void> => {
        if (query === undefined) {
          tm.openManialink(this.openId, info.login)
          return
        }
        if (query === 'jb') { query = 'jukebox' }
        const option = query.split(' ').filter(a => a !== '')[0]
        const arr = ['jukebox', 'name', 'karma', 'short', 'long', 'best', 'worst', 'worstkarma'] as const
        const o = arr.find(a => a === option)
        if (o !== undefined) {
          await this.openWithOption(info.login, o)
          return
        }
        if (query.startsWith('$a')) {
          this.openWithQuery(info.login, query.slice(2), true)
        } else {
          this.openWithQuery(info.login, query)
        }
      },
      privilege: 0
    })
    tm.commands.add({
      aliases: ['best'],
      help: 'Display list of maps sorted by rank ascending.',
      callback: async (info: tm.MessageInfo): Promise<void> => {
        await this.openWithOption(info.login, 'best')
      },
      privilege: 0
    })
    tm.commands.add({
      aliases: ['worst'],
      help: 'Display list of maps sorted by rank descending.',
      callback: async (info: tm.MessageInfo): Promise<void> => {
        await this.openWithOption(info.login, 'worst')
      },
      privilege: 0
    })
    tm.commands.add({
      aliases: ['jb', 'jukebox'],
      help: 'Display jukebox.',
      callback: async (info: tm.MessageInfo): Promise<void> => {
        await this.openWithOption(info.login, 'jukebox')
      },
      privilege: 0
    })
    maplist.onListUpdate(() => this.reRender())
    maplist.onJukeboxUpdate(() => this.reRender())
  }

  async openWithOption(login: string, option: 'jukebox' | 'name' | 'karma' | 'short' | 'long' | 'best' | 'worst' | 'worstkarma'): Promise<void> {
    let list: readonly Readonly<tm.Map>[] = []
    if (option === 'best' || option === 'worst') {
      list = await maplist.getByPosition(login, option)
    } else {
      list = maplist.get(option)
    }
    const paginator = this.getPaginator(login, list)
    this.displayToPlayer(login, { page: 1, paginator, list }, `1/${paginator.pageCount}`)
  }

  openWithQuery(login: string, query: string, searchByAuthor?: true) {
    const list = searchByAuthor === true ? maplist.searchByAuthor(query) : maplist.searchByName(query)
    const paginator = this.getPaginator(login, list)
    this.displayToPlayer(login, { page: 1, paginator, list }, `1/${paginator.pageCount}`)
  }

  private getPaginator(login: string, list: readonly tm.Map[]) {
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
      let paginator = this.paginator
      let list = maplist.get()
      if (obj !== undefined) {
        paginator = obj.paginator
        list = obj.list
      }
      const page = paginator.getPageByLogin(login)
      let pageCount = Math.ceil(list.length / (config.rows * config.columns))
      if (pageCount === 0) { pageCount++ }
      if (page === undefined) {
        this.displayToPlayer(login, { page: 1, paginator, list }, `1/${pageCount}`)
        return
      }
      this.displayToPlayer(login, { page, paginator, list }, `${page}/${pageCount}`)
    }
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    let pageCount = Math.ceil(tm.maps.count / (config.rows * config.columns))
    if (pageCount === 0) { pageCount++ }
    if (page === undefined) {
      this.displayToPlayer(info.login, { page: 1, paginator: this.paginator }, `1/${pageCount}`)
      return
    }
    this.paginator.setPageCount(pageCount)
    const index = this.playerQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.playerQueries[index].paginator.destroy()
      this.playerQueries.splice(index, 1)
    }
    this.displayToPlayer(info.login, { page, paginator: this.paginator }, `${page}/${pageCount}`)
  }

  protected onClose(info: ManialinkClickInfo): void {
    const index = this.playerQueries.findIndex(a => a.login === info.login)
    if (index !== -1) {
      this.playerQueries[index].paginator.destroy()
      this.playerQueries.splice(index, 1)
    }
    this.hideToPlayer(info.login)
  }

  protected async constructContent(login: string, params?: { page: number, list?: readonly tm.Map[] }): Promise<string> {
    const maps = params?.list ?? maplist.get()
    const startIndex = (config.rows * config.columns) * ((params?.page ?? 1) - 1)
    const mapsToDisplay = Math.min(maps.length - startIndex, config.rows * config.columns)
    const recordIndexStrings = await this.getRecordIndexStrings(login, ...maps.slice(startIndex,
      (config.rows * config.columns) + startIndex).map(a => a.id))
    const cell = (i: number, j: number, w: number, h: number) => {
      const gridIndex = (i * config.columns) + j
      const recordIndexString = recordIndexStrings[gridIndex]
      const index = startIndex + gridIndex
      const actionId = this.getActionId(maps[index].id)
      const header = this.getHeader(login, index, maps[index].id, actionId, w, h)
      const rowH = (h - this.margin) / 4
      const width = (w - this.margin * 3) - config.iconWidth
      const karmaW = width - (config.timeWidth + config.positionWidth + this.margin * 4 + config.iconWidth * 2)
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
              ${verticallyCenteredText(tm.utils.safeString(tm.utils.strip(maps[index].name, false)), width,
        rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 2} 2">
            <quad posn="0 0 3" sizen="${config.iconWidth} ${rowH - this.margin}" bgcolor="${config.iconBackground}"/>
            <quad posn="${this.margin} ${-this.margin} 4" 
             sizen="${config.iconWidth - this.margin * 2} ${rowH - this.margin * 3}" image="${config.icons[2]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${verticallyCenteredText(tm.utils.safeString(maps[index].author), width, rowH - this.margin, { textScale: config.textScale })}
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
             image="${config.icons[5]}"/>
            <frame posn="${config.iconWidth + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${karmaW} ${rowH - this.margin}" bgcolor="${config.contentBackground}"/>
              ${centeredText(maps[index].voteRatio === -1 ? config.defaultText : maps[index].voteRatio.toFixed(0), karmaW,
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
    const map = maplist.get().find(a => a.id === mapId)
    if (map === undefined) {
      tm.sendMessage(config.messages.error, login)
      tm.log.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${mapId} in memory`)
      return false
    }
    if (tm.jukebox.juked.some(a => a.map.id === mapId)) {
      tm.jukebox.remove(mapId, { login, nickname })
      tm.sendMessage(tm.utils.strVar(config.messages.remove,
        { player: tm.utils.strip(nickname, true), map: tm.utils.strip(map.name, true) }), config.public === true ? undefined : login)
    }
    else {
      if (privilege <= 0 && tm.jukebox.juked.some(a => a.callerLogin === login)) {
        tm.sendMessage(config.messages.noPermission, login)
        return false
      }
      tm.jukebox.add(mapId, { login, nickname })
      tm.sendMessage(tm.utils.strVar(config.messages.add,
        { player: tm.utils.strip(nickname, true), map: tm.utils.strip(map.name, true) }), config.public === true ? undefined : login)
    }
    return true
  }

  private async getRecordIndexStrings(login: string, ...mapIds: string[]): Promise<string[]> { // TODO
    const records = await tm.records.fetchByMap(...mapIds)
    const positions: number[] = []
    let i = -1
    while (true) {
      i++
      if (records[i] === undefined) { break }
      const id = records[i].map
      if (positions[mapIds.indexOf(id)] !== undefined) { continue }
      let index = 0
      let j = 0
      while (true) {
        if (records[j] === undefined) {
          positions[mapIds.indexOf(id)] = -1
          break
        }
        if (records[j].map === id) {
          if (records[j].login === login) {
            positions[mapIds.indexOf(id)] = index + 1
            break
          }
          index++
        }
        j++
      }
    }
    const ret: string[] = []
    for (let i = 0; i < mapIds.length; i++) {
      if (positions[i] === -1 || positions[i] === undefined) { ret.push(config.texts.noRank) }
      else { ret.push(tm.utils.getPositionString(positions[i])) }
    }
    return ret
  }

  private getActionId(mapId: string): number {
    const challengeActionId = this.challengeActionIds.indexOf(mapId)
    if (challengeActionId !== -1) { return challengeActionId + this.openId + this.mapAddId }
    else {
      this.challengeActionIds.push(mapId)
      return this.challengeActionIds.length - 1 + this.openId + this.mapAddId
    }
  }

  private getHeader(login: string, mapIndex: number, mapId: string, actionId: number, w: number, h: number): string {
    const width = (w - this.margin * 3) - config.iconWidth
    const height = h - this.margin
    const index = tm.jukebox.juked.findIndex(a => a.map.id === mapId)
    const prevIndex = [tm.maps.current, ...tm.jukebox.history].findIndex(a => a.id === mapId)
    const player = tm.players.get(login)
    if (player === undefined) { return '' }
    let overlay: string | undefined
    if (player?.privilege <= 0 && (prevIndex !== -1 || (tm.jukebox.juked[index]?.callerLogin !== undefined &&
      tm.jukebox.juked[index].callerLogin !== login))) {
      overlay = `<quad posn="0 0 8" sizen="${w} ${h}" bgcolor="${config.overlayBackground}"/>
        <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>`
    }
    if (index !== -1) {
      return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${config.blankImage}" 
            imagefocus="${config.minusImage}"/>`}
          <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${config.icons[0]}"/>
          <frame posn="${config.iconWidth + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width - (this.margin * 2 + config.queueWidth + config.queueNumberWidth)} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${verticallyCenteredText(`${config.texts.map}${mapIndex + 1}`, width - (this.margin * 2 + config.queueWidth) + config.queueNumberWidth, height / 4 - this.margin, { textScale: config.textScale })}
          </frame>
          <frame posn="${config.iconWidth + width - (config.queueWidth + config.queueNumberWidth)} 0 1">
            <quad posn="0 0 3" sizen="${config.queueWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${centeredText(`$${config.colour}${config.texts.queued}`, config.queueWidth, height / 4 - this.margin, { padding: config.padding, textScale: config.textScale })}
          <frame posn="${config.queueWidth + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${config.queueNumberWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${centeredText(`$${config.colour}${tm.utils.getPositionString(index + 1)}`, config.queueNumberWidth, height / 4 - this.margin, { padding: config.padding, textScale: config.textScale })}
          </frame>
          </frame>`
    }
    return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${config.blankImage}" 
            imagefocus="${config.plusImage}"/>`}
          <quad posn="0 0 3" sizen="${config.iconWidth} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${config.iconWidth - this.margin * 2} ${(height / 4) - this.margin * 3}" 
           image="${config.icons[0]}"/>
          <frame posn="${config.iconWidth + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width} ${height / 4 - this.margin}" bgcolor="${config.iconBackground}"/>
            ${verticallyCenteredText(`${config.texts.map}${mapIndex + 1}`, width, height / 4 - this.margin, { textScale: config.textScale })}
          </frame>`
  }

} 
