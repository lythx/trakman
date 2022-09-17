import PopupWindow from "../PopupWindow.js";
import { trakman as tm } from "../../../src/Trakman.js";
import { centeredText, closeButton, Grid, IDS, verticallyCenteredText } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js";
import { maplist } from '../../maplist/Maplist.js'
import config from './MapList.config.js'

export default class MapList extends PopupWindow {

  private readonly paginator: Paginator
  private readonly mapAddId = 1000
  private readonly grid: Grid
  private readonly challengeActionIds: string[] = []
  private readonly contentBg = config.contentBackground
  private readonly iconBg = config.iconBackground
  private readonly icons = config.icons
  private readonly playerQueries: { paginator: Paginator, list: readonly TMMap[], login: string }[] = []
  private readonly iconW = config.iconWidth
  private readonly queueW = config.queueWidth
  private readonly queueNumberW = config.queueNumberWidth
  private readonly timeW = config.timeWidth
  private readonly positionW = config.positionWidth
  private readonly paginatorIdOffset = 7000
  private nextPaginatorId = 0
  private sortedList: TMMap[]

  constructor() {
    super(IDS.mapList, config.icon, config.title, config.navbar)
    const arr = tm.maps.list.sort((a, b) => a.name.localeCompare(b.name))
    this.sortedList = arr.sort((a, b) => a.author.localeCompare(b.author))
    const pageCount = Math.ceil(this.sortedList.length / (config.rows * config.columns))
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, pageCount)
    this.paginator.onPageChange = (login: string, page: number) => {
      let pageCount = Math.ceil(this.sortedList.length / (config.rows * config.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.setPageCount(pageCount)
      this.displayToPlayer(login, { page, paginator: this.paginator, list: this.sortedList }, `${page}/${pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.columns).fill(1),
      new Array(config.rows).fill(1), config.grid)
    tm.addListener('ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + this.mapAddId && info.answer <= this.openId + this.mapAddId + 5000) {
        const mapId = this.challengeActionIds[info.answer - (this.openId + this.mapAddId)]
        if (mapId === undefined) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Error while adding the map to queue.`, info.login)
          tm.log.error('Error while adding map to queue from jukebox', `Challenge index out of range`)
          return
        }
        const gotQueued = this.handleMapClick(mapId, info.login, info.nickname, info.privilege)
        if (gotQueued === false) { return }
        this.reRender()
      }
    })
    tm.commands.add({
      aliases: ['l', 'ml', 'list'],
      help: 'Display list of maps. Start with $a to author search. Options: name, karma, short, long, best, worst, worstkarma.',
      params: [{ name: 'query', optional: true, type: 'multiword' }],
      callback: async (info: TMMessageInfo, query?: string): Promise<void> => {
        if (query === undefined) {
          tm.openManialink(this.openId, info.login)
          return
        }
        const option = query.split(' ').filter(a => a !== '')[0]
        const arr: ['name', 'karma', 'short', 'long', 'best', 'worst', 'worstkarma', 'bestkarma'] = ['name', 'karma', 'short', 'long', 'best', 'worst', 'worstkarma', 'bestkarma']
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
      callback: async (info: TMMessageInfo): Promise<void> => {
        await this.openWithOption(info.login, 'best')
      },
      privilege: 0
    })
    tm.commands.add({
      aliases: ['worst'],
      help: 'Display list of maps sorted by rank descending.',
      callback: async (info: TMMessageInfo): Promise<void> => {
        await this.openWithOption(info.login, 'worst')
      },
      privilege: 0
    })
    tm.addListener('MapRemoved', (map) => this.updateList(map.id))
    tm.addListener('MapAdded', (map) => this.updateList(map.id))
    tm.addListener('BeginMap', () => this.reRender())
  }

  private updateList(id: string) {
    const arr = tm.maps.list.sort((a, b) => a.name.localeCompare(b.name))
    this.sortedList = arr.sort((a, b) => a.author.localeCompare(b.author))
    let pageCount = Math.ceil(this.sortedList.length / (config.rows * config.columns))
    if (pageCount === 0) { pageCount++ }
    this.paginator.setPageCount(pageCount)
    for (const e of this.playerQueries) {
      const newList = [...e.list]
      newList.splice(e.list.findIndex(a => a.id === id), 1)
      e.list = newList
    }
    this.reRender()
  }

  async openWithOption(login: string, option: 'name' | 'karma' | 'short' | 'long' | 'best' | 'worst' | 'worstkarma' | 'bestkarma') {
    let list: TMMap[] = []
    if (option === 'best' || option === 'worst') {
      list = await maplist.getByPosition(login, option)
    } else {
      list = [...maplist.get(option)]
    }
    const pageCount = Math.ceil(list.length / (config.rows * config.columns))
    const index = this.playerQueries.findIndex(a => a.login === login)
    if (index !== -1) {
      this.playerQueries.splice(index, 1)
    }
    const paginator = this.getPaginator(login, list, pageCount)
    this.displayToPlayer(login, { page: 1, paginator, list }, `1/${pageCount}`)
  }

  openWithQuery(login: string, query: string, searchByAuthor?: true) {
    const list = searchByAuthor === true ? maplist.searchByAuthor(query) : maplist.searchByName(query)
    const pageCount = Math.ceil(list.length / (config.rows * config.columns))
    const index = this.playerQueries.findIndex(a => a.login === login)
    if (index !== -1) {
      this.playerQueries.splice(index, 1)
    }
    const paginator = this.getPaginator(login, list, pageCount)
    this.displayToPlayer(login, { page: 1, paginator, list }, `1/${pageCount}`)
  }

  private getPaginator(login: string, list: readonly TMMap[], pageCount: number) {
    const playerQuery = this.playerQueries.find(a => a.login === login)
    let paginator: Paginator
    if (playerQuery !== undefined) {
      const prevLgt = playerQuery.list.length
      playerQuery.list = list
      paginator = playerQuery.paginator
      paginator.setPageForLogin(login, 1)
      if (prevLgt !== list.length) {
        paginator.setPageCount(pageCount)
        paginator.onPageChange = (login: string, page: number) => this.displayToPlayer(login,
          { page, paginator, list }, `${page}/${pageCount}`)
      }
    } else {
      paginator = new Paginator(this.openId + this.paginatorIdOffset + this.nextPaginatorId, this.windowWidth, this.footerHeight, pageCount)
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
      let list: readonly TMMap[] = this.sortedList
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
      this.paginator.setPageCount(pageCount)
      this.displayToPlayer(login, { page, paginator, list }, `${page}/${pageCount}`)
    }
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    let pageCount = Math.ceil(this.sortedList.length / (config.rows * config.columns))
    if (pageCount === 0) { pageCount++ }
    if (page === undefined) {
      this.displayToPlayer(info.login, { page: 1, paginator: this.paginator, list: this.sortedList }, `1/${pageCount}`)
      return
    }
    this.paginator.setPageCount(pageCount)
    const index = this.playerQueries.findIndex(a => a.login === info.login)
    this.playerQueries.splice(index, 1)
    this.displayToPlayer(info.login, { page, paginator: this.paginator, list: this.sortedList }, `${page}/${pageCount}`)
  }

  protected onClose(info: ManialinkClickInfo): void {
    const index = this.playerQueries.findIndex(a => a.login === info.login)
    this.playerQueries.splice(index, 1)
    const index2 = PopupWindow.playersWithWindowOpen.findIndex(a => a.login === info.login)
    if (index2 !== -1) {
      PopupWindow.playersWithWindowOpen.splice(index2, 1)
    }
    this.hideToPlayer(info.login)
  }

  protected async constructContent(login: string, params: { page: number, list: TMMap[] }): Promise<string> {
    const maps = params.list
    const startIndex = (config.rows * config.columns) * (params.page - 1)
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
      const width = (w - this.margin * 3) - this.iconW
      const karmaW = width - (this.timeW + this.positionW + this.margin * 4 + this.iconW * 2)
      return `
        <frame posn="${this.margin} ${-this.margin} 3">
          <format textsize="1"/>
          ${header}
          <frame posn="0 ${-rowH} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4"
             sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${this.icons[1]}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${verticallyCenteredText(tm.utils.safeString(tm.utils.strip(maps[index].name, false)), width,
        rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 2} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" 
             sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${this.icons[2]}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${verticallyCenteredText(tm.utils.safeString(maps[index].author), width, rowH - this.margin, { textScale: config.textScale })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" 
             image="${this.icons[3]}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${this.timeW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(tm.utils.getTimeString(maps[index].authorTime), this.timeW, rowH - this.margin,
          { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
          <frame posn="${this.timeW + this.iconW + this.margin * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" 
             image="${this.icons[4]}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${this.positionW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(` ${recordIndexString} `, this.positionW, rowH - this.margin, { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
          <frame posn="${this.timeW + this.positionW + this.margin * 4 + this.iconW * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}"
             image="${this.icons[5]}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${karmaW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(Math.round(maps[index].voteRatio).toString(), karmaW,
            rowH - this.margin, { textScale: config.textScale, padding: config.padding })}
            </frame>
          </frame>
        </frame>`
    }
    return this.grid.constructXml(new Array(mapsToDisplay).fill(cell))
  }

  protected constructFooter(login: string, params: { paginator: Paginator }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + params.paginator.constructXml(login)
  }

  private handleMapClick(mapId: string, login: string, nickname: string, privilege: number): boolean {
    const challenge = this.sortedList.find(a => a.id === mapId)
    if (challenge === undefined) {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Error while adding the map to queue.`, login)
      tm.log.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${mapId} in memory`)
      return false
    }
    if (tm.jukebox.juked.some(a => a.map.id === mapId)) {
      tm.jukebox.remove(mapId, { login, nickname })
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(nickname, true)} `
        + `${tm.utils.palette.vote}removed ${tm.utils.palette.highlight + tm.utils.strip(challenge.name, true)}${tm.utils.palette.vote} from the queue.`)
    }
    else {
      if (privilege <= 0 && tm.jukebox.juked.some(a => a.callerLogin === login)) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.vote}You can't add more than one map to the queue.`, login)
        return false
      }
      tm.jukebox.add(mapId, { login, nickname })
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(nickname, true)} `
        + `${tm.utils.palette.vote}added ${tm.utils.palette.highlight + tm.utils.strip(challenge.name, true)}${tm.utils.palette.vote} to the queue.`)
    }
    return true
  }

  private async getRecordIndexStrings(login: string, ...mapIds: string[]): Promise<string[]> {
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
    const width = (w - this.margin * 3) - this.iconW
    const height = h - this.margin
    const index = tm.jukebox.juked.findIndex(a => a.map.id === mapId)
    const prevIndex = [tm.maps.current, ...tm.jukebox.history].findIndex(a => a.id === mapId)
    const player = tm.players.get(login)
    if (player === undefined) { return '' }
    let overlay: string | undefined
    if (player?.privilege <= 0 && (prevIndex !== -1 || (tm.jukebox.juked[index]?.callerLogin !== undefined &&
      tm.jukebox.juked[index].callerLogin !== login))) {
      overlay = `<quad posn="0 0 8" sizen="${w} ${h}" bgcolor="${config.overlayBackground}"/>
        <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>`
    }
    if (index !== -1) {
      return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${config.blankImage}" 
            imagefocus="${config.minusImage}"/>`}
          <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${this.icons[0]}"/>
          <frame posn="${this.iconW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width - (this.margin * 2 + this.queueW + this.queueNumberW)} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`${config.texts.map}${mapIndex + 1}`, width - (this.margin * 2 + this.queueW) + this.queueNumberW, height / 4 - this.margin, { textScale: config.textScale })}
          </frame>
          <frame posn="${this.iconW + width - (this.queueW + this.queueNumberW)} 0 1">
            <quad posn="0 0 3" sizen="${this.queueW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${centeredText(`${config.colour}${config.texts.queued}`, this.queueW, height / 4 - this.margin, { padding: config.padding, textScale: config.textScale })}
          <frame posn="${this.queueW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${this.queueNumberW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${centeredText(`${config.colour}${tm.utils.getPositionString(index + 1)}`, this.queueNumberW, height / 4 - this.margin, { padding: config.padding, textScale: config.textScale })}
          </frame>
          </frame>`
    }
    return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${config.blankImage}" 
            imagefocus="${config.plusImage}"/>`}
          <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${(height / 4) - this.margin * 3}" 
           image="${this.icons[0]}"/>
          <frame posn="${this.iconW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`${config.texts.map}${mapIndex + 1}`, width, height / 4 - this.margin, { textScale: config.textScale })}
          </frame>`
  }

} 
