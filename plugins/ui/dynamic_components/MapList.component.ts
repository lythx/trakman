import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { centeredText, closeButton, CONFIG, Grid, IDS,  verticallyCenteredText, getIcon } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js";

export default class MapList extends PopupWindow {

  readonly columns = CONFIG.mapList.columns
  readonly rows = CONFIG.mapList.rows
  private readonly paginator: Paginator
  private readonly mapAddId = 1000
  private readonly grid: Grid
  private readonly challengeActionIds: string[] = []
  private readonly contentBg = CONFIG.mapList.contentBackground
  private readonly iconBg = CONFIG.mapList.iconBackground
  private readonly icons = CONFIG.mapList.icons
  private readonly playerQueries: { paginator: Paginator, list: TMMap[], login: string }[] = []
  private readonly iconW = CONFIG.mapList.iconWidth
  private readonly queueW = CONFIG.mapList.queueWidth
  private readonly queueNumberW = CONFIG.mapList.queueNumberWidth
  private readonly timeW = CONFIG.mapList.timeWidth
  private readonly positionW = CONFIG.mapList.positionWidth
  private readonly paginatorIdOffset = 7000
  private nextPaginatorId = 0

  constructor() {
    super(IDS.mapList, getIcon(CONFIG.mapList.icon), CONFIG.mapList.title, CONFIG.mapList.navbar)
    const pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, pageCount)
    this.paginator.onPageChange = (login: string, page: number) => {
      let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.setPageCount(pageCount)
      this.displayToPlayer(login, { page, paginator: this.paginator, list: TM.maps }, `${page}/${pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(this.columns).fill(1), new Array(this.rows).fill(1),
      { background: 'FFFA', margin: CONFIG.grid.margin })
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + this.mapAddId && info.answer <= this.openId + this.mapAddId + 5000) {
        const mapId = this.challengeActionIds[info.answer - (this.openId + this.mapAddId)]
        if (mapId === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
          TM.error('Error while adding map to queue from jukebox', `Challenge index out of range`)
          return
        }
        const gotQueued = this.handleMapClick(mapId, info.login, info.nickname, info.privilege)
        if (gotQueued === false) { return }
        this.reRender()
      }
    })
    TM.addCommand({
      aliases: ['l', 'ml', 'list'],
      help: 'Display list of maps.',
      params: [{ name: 'query', optional: true, type: 'multiword' }],
      callback: (info: MessageInfo, query?: string): void => {
        if (query === undefined) {
          TM.openManialink(this.openId, info.login)
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
    TM.addListener(['Controller.MapAdded', 'Controller.MapRemoved'], () => {
      let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.setPageCount(pageCount)
      this.reRender()
    })
  }

  openWithQuery(login: string, query: string, searchByAuthor?: true) {
    const matches = (searchByAuthor === true ? TM.matchString(query, TM.maps, 'author') :
      TM.matchString(query, TM.maps, 'name', true)).filter(a => a.value > 0.1)
    const playerQuery = this.playerQueries.find(a => a.login === login)
    const pageCount = Math.ceil(matches.length / (this.rows * this.columns))
    const list = matches.map(a => a.obj)
    let paginator: Paginator
    if (playerQuery !== undefined) {
      const prevLgt = playerQuery.list.length
      playerQuery.list = list
      paginator = playerQuery.paginator
      paginator.setPageForLogin(login, 1)
      if (prevLgt !== list.length) {
        paginator.setPageCount(pageCount)
        paginator.onPageChange = (login: string, page: number) => this.displayToPlayer(login, { page, paginator, list }, `${page}/${pageCount}`)
      }
    } else {
      paginator = new Paginator(this.openId + this.paginatorIdOffset + this.nextPaginatorId, this.windowWidth, this.footerHeight, pageCount)
      this.nextPaginatorId += 10
      this.nextPaginatorId = this.nextPaginatorId % 3000
      this.playerQueries.push({ paginator, login, list })
      paginator.onPageChange = (login: string, page: number) => this.displayToPlayer(login, { page, paginator, list }, `${page}/${pageCount}`)
    }
    this.displayToPlayer(login, { page: 1, paginator, list }, `1/${pageCount}`)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const obj = this.playerQueries.find(a => a.login === login)
      let paginator = this.paginator
      let list = TM.maps
      if (obj !== undefined) {
        paginator = obj.paginator
        list = obj.list
      }
      const page = paginator.getPageByLogin(login)
      let pageCount = Math.ceil(list.length / (this.rows * this.columns))
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
    let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
    if (pageCount === 0) { pageCount++ }
    if (page === undefined) {
      this.displayToPlayer(info.login, { page: 1, paginator: this.paginator, list: TM.maps }, `1/${pageCount}`)
      return
    }
    this.paginator.setPageCount(pageCount)
    const index = this.playerQueries.findIndex(a => a.login === info.login)
    this.playerQueries.splice(index, 1)
    this.displayToPlayer(info.login, { page, paginator: this.paginator, list: TM.maps }, `${page}/${pageCount}`)
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

  protected constructContent(login: string, params: { page: number, list: TMMap[] }): string {
    const maps = params.list
    const startIndex = (this.rows * this.columns) * (params.page - 1)
    const mapsToDisplay = Math.min(maps.length - startIndex, this.rows * this.columns)
    const cell = (i: number, j: number, w: number, h: number) => {
      const index = startIndex + (i * this.columns) + j
      const recordIndexString = this.getRecordIndexString(login, maps[index].id)
      const actionId = this.getActionId(maps[index].id)
      const header = this.getHeader(login, index, maps[index].id, actionId, w, h)
      const rowH = (h - this.margin) / 4
      const width = (w - this.margin * 3) - this.iconW
      const karmaW = width - (this.timeW + this.positionW + this.margin * 4 + this.iconW * 2)
      const karmaRatio = TM.voteRatios.find(a => a.mapId === maps[index].id)?.ratio
      return `
        <frame posn="${this.margin} ${-this.margin} 3">
          <format textsize="1"/>
          ${header}
          <frame posn="0 ${-rowH} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${getIcon(this.icons[0])}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${verticallyCenteredText(TM.safeString(TM.strip(maps[index].name, false)), width, rowH - this.margin, { textScale: 1 })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 2} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${getIcon(this.icons[4])}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${verticallyCenteredText(TM.safeString(maps[index].author), width, rowH - this.margin, { textScale: 1 })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${getIcon(this.icons[2])}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${this.timeW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(TM.Utils.getTimeString(maps[index].authorTime), this.timeW, rowH - this.margin, { textScale: 1, padding: 0.2 })}
            </frame>
          </frame>
          <frame posn="${this.timeW + this.iconW + this.margin * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${getIcon(this.icons[3])}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${this.positionW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(` ${recordIndexString} `, this.positionW, rowH - this.margin, { textScale: 1, padding: 0 })}
            </frame>
          </frame>
          <frame posn="${this.timeW + this.positionW + this.margin * 4 + this.iconW * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${getIcon(this.icons[4])}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${karmaW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(karmaRatio === undefined ? '-' : Math.round(karmaRatio).toString(), karmaW, rowH - this.margin, { textScale: 1, padding: 0.1 })}
            </frame>
          </frame>
        </frame>`
    }
    return this.grid.constructXml(new Array(mapsToDisplay).fill(cell))
  }

  protected constructFooter(login: string, params: { paginator: Paginator }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + params.paginator.constructXml(login)
  }

  private handleMapClick(mapId: string, login: string, nickName: string, privilege: number): boolean {
    const challenge = TM.maps.find(a => a.id === mapId)
    if (challenge === undefined) {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, login)
      TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${mapId} in memory`)
      return false
    }
    if (TM.jukebox.some(a => a.map.id === mapId)) {
      TM.removeFromJukebox(mapId, login)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
    }
    else {
      if (privilege <= 0 && TM.jukebox.find(a => a.callerLogin === login)) {
        TM.sendMessage(`You can't add more than one map to the jukebox.`)
        return false
      }
      TM.addToJukebox(mapId, login)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} to the queue.`)
    }
    return true
  }

  private getRecordIndexString(login: string, mapId: string): string {
    const recordIndex = TM.records.filter(a => a.map === mapId).sort((a, b) => a.time - b.time).findIndex(a => a.login === login) + 1
    if (recordIndex === 0) { return "--." }
    else { return TM.Utils.getPositionString(recordIndex) }
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
    const index = TM.jukebox.findIndex(a => a.map.id === mapId)
    const prevIndex = TM.previousMaps.findIndex(a => a.id === mapId)
    const player = TM.getPlayer(login)
    if (player === undefined) { return '' }
    let overlay: string | undefined
    if (player?.privilege <= 0 && (prevIndex !== -1 || (TM.jukebox[index]?.callerLogin !== undefined && TM.jukebox[index].callerLogin !== login))) {
      overlay = `<quad posn="0 0 8" sizen="${w} ${h}" bgcolor="7777"/>
        <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>`
    }
    if (index !== -1) {
      return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${getIcon('blank')}" 
            imagefocus="${getIcon(CONFIG.mapList.minusImage)}"/>`}
          <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${getIcon(this.icons[1])}"/>
          <frame posn="${this.iconW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width - (this.margin * 2 + this.queueW + this.queueNumberW)} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`Map #${mapIndex + 1}`, width - (this.margin * 2 + this.queueW) + this.queueNumberW, height / 4 - this.margin, { textScale: 1 })}
          </frame>
          <frame posn="${this.iconW + width - (this.queueW + this.queueNumberW)} 0 1">
            <quad posn="0 0 3" sizen="${this.queueW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${centeredText(`$0F0Queued`, this.queueW, height / 4 - this.margin, { padding: 0.1, textScale: 1 })}
          <frame posn="${this.queueW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${this.queueNumberW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${centeredText(`$0F0${TM.Utils.getPositionString(index + 1)}`, this.queueNumberW, height / 4 - this.margin, { padding: 0.1, textScale: 1 })}
          </frame>
          </frame>`
    }
    return `${overlay ?? `<quad posn="${-this.margin} ${this.margin} 8" sizen="${w} ${h}" action="${actionId}"
            image="${getIcon('blank')}" 
            imagefocus="${getIcon(CONFIG.mapList.plusImage)}"/>`}
          <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${getIcon(this.icons[1])}"/>
          <frame posn="${this.iconW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`Map #${mapIndex + 1}`, width, height / 4 - this.margin, { textScale: 1 })}
          </frame>`
  }

} 