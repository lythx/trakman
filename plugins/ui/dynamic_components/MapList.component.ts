import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { centeredText, closeButton, CONFIG, Grid, ICONS, IDS, stringToObjectProperty, verticallyCenteredText } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js";

const MAP_ADD_ID = 1000

export default class MapList extends PopupWindow {

  readonly columns = CONFIG.mapList.columns
  readonly rows = CONFIG.mapList.rows
  private readonly paginator: Paginator
  private readonly mapAddId = MAP_ADD_ID
  private readonly grid: Grid
  private readonly format = CONFIG.static.format
  private readonly challengeActionIds: string[] = []
  private readonly contentBg = '555C'
  private readonly iconBg = '222C'
  private readonly playerQueries: { paginator: Paginator, list: TMMap[], login: string }[] = []
  private readonly iconW = 2
  private readonly queuePositionW = 8.5
  private readonly timeW = 5
  private readonly positionW = 3.1

  constructor() {
    super(IDS.mapList, stringToObjectProperty(CONFIG.mapList.icon, ICONS), CONFIG.mapList.title, CONFIG.mapList.navbar)
    const pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, pageCount)
    this.paginator.onPageChange((login: string, page: number) => {
      let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.updatePageCount(pageCount)
      this.displayToPlayer(login, { page, paginator: this.paginator, list: TM.maps }, `${page}/${pageCount}`)
    })
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(this.columns).fill(1), new Array(this.rows).fill(1),
      { background: 'FFFA', margin: CONFIG.grid.margin })
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + this.mapAddId && info.answer <= this.openId + this.mapAddId + 5000) {
        const challengeId = this.challengeActionIds[info.answer - (this.openId + this.mapAddId)]
        if (challengeId === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
          TM.error('Error while adding map to queue from jukebox', `Challenge index out of range`)
          return
        }
        this.handleMapClick(challengeId, info.login, info.nickname)
        const page = this.paginator.getPageByLogin(info.login)
        let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
        if (pageCount === 0) { pageCount++ }
        if (page === undefined) {
          this.displayToPlayer(info.login, { page: 1, paginator: this.paginator, list: TM.maps }, `1/${pageCount}`)
          return
        }
        this.paginator.updatePageCount(pageCount)
        this.displayToPlayer(info.login, { page, paginator: this.paginator, list: TM.maps }, `${page}/${pageCount}`)
      }
    })
    TM.addCommand({
      aliases: ['l', 'ml', 'list'],
      help: 'Display list of maps.',
      params: [{ name: 'query', optional: true }],
      callback: (info: MessageInfo, query?: string): void => {
        if (query === undefined) {
          TM.openManialink(this.openId, info.login)
          return
        }
        this.openWithQuery(info.login, query)
      },
      privilege: 0
    })
  }

  openWithQuery(login: string, query: string) {
    const matches = TM.matchString(query, TM.maps, 'name')
    const playerQuery = this.playerQueries.find(a => a.login === login)
    const pageCount = Math.ceil(matches.length / (this.rows * this.columns))
    let page = 1
    let paginator: Paginator
    if (playerQuery !== undefined) {
      playerQuery.list = matches
      paginator = playerQuery.paginator
      paginator.updatePageCount(pageCount)
      page = this.paginator.getPageByLogin(login)
    } else {
      paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, pageCount)
      this.playerQueries.push({ paginator, login, list: matches })
      paginator.onPageChange(() => this.openWithQuery(login, query))
    }
    this.displayToPlayer(login, { page, paginator, list: matches }, `${page}/${pageCount}`)
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
    if (pageCount === 0) { pageCount++ }
    if (page === undefined) {
      this.displayToPlayer(info.login, { page: 1, paginator: this.paginator, list: TM.maps }, `1/${pageCount}`)
      return
    }
    this.paginator.updatePageCount(pageCount)
    this.displayToPlayer(info.login, { page, paginator: this.paginator, list: TM.maps }, `${page}/${pageCount}`)
  }

  protected constructContent(login: string, params: { page: number, list: TMMap[] }): string {
    const maps = params.list
    let mapIndex = (this.rows * this.columns) * (params.page - 1)
    const mapsToDisplay = Math.min(maps.length - (mapIndex + 1), this.rows * this.columns)
    const cell = (i: number, j: number, w: number, h: number) => {
      const recordIndexString = this.getRecordIndexString(login, maps[mapIndex].id)
      const actionId = this.getActionId(maps[mapIndex].id)
      const header = this.getHeader(mapIndex, maps[mapIndex].id, actionId, w, h)
      mapIndex++
      const rowH = (h - this.margin) / 4
      const width = (w - this.margin * 3) - this.iconW
      const karmaW = width - (this.timeW + this.positionW + this.margin * 4 + this.iconW * 2)
      return `
        <frame posn="${this.margin} ${-this.margin} 3">
          ${header}
          <format textsize="1"/>
          <frame posn="0 ${-rowH} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${ICONS.tag}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${verticallyCenteredText(this.format +TM.safeString(TM.strip(maps[mapIndex].name, false)), width, rowH - this.margin, { textScale: 1 })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 2} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${ICONS.person.white}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${width} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${verticallyCenteredText(this.format + TM.safeString(maps[mapIndex].author), width, rowH - this.margin, { textScale: 1 })}
            </frame>
          </frame>
          <frame posn="0 ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${ICONS.timer.author}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${this.timeW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(TM.Utils.getTimeString(maps[mapIndex].authorTime), this.timeW, rowH - this.margin, { textScale: 1, padding: 0.2 })}
            </frame>
          </frame>
          <frame posn="${this.timeW + this.iconW + this.margin * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${ICONS.stats}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${this.positionW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText(` ${recordIndexString} `, this.positionW, rowH - this.margin, { textScale: 1, padding: 0 })}
            </frame>
          </frame>
          <frame posn="${this.timeW + this.positionW + this.margin * 4 + this.iconW * 2} ${-rowH * 3} 2">
            <quad posn="0 0 3" sizen="${this.iconW} ${rowH - this.margin}" bgcolor="${this.iconBg}"/>
            <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${rowH - this.margin * 3}" image="${ICONS.heart}"/>
            <frame posn="${this.iconW + this.margin} 0 2">
              <quad posn="0 0 2" sizen="${karmaW} ${rowH - this.margin}" bgcolor="${this.contentBg}"/>
              ${centeredText('100', karmaW, rowH - this.margin, { textScale: 1, padding: 0.1 })}
            </frame>
          </frame>
        </frame>`
    }
    return this.grid.constructXml(new Array(mapsToDisplay).fill(cell))
  }

  protected constructFooter(login: string, params: { paginator: Paginator }): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + params.paginator.constructXml(login)
  }

  private handleMapClick(mapId: string, login: string, nickName: string) {
    const challenge = TM.maps.find(a => a.id === mapId)
    if (challenge === undefined) {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, login)
      TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${mapId} in memory`)
      return
    }
    if (TM.jukebox.some(a => a.id === mapId)) {
      TM.removeFromJukebox(mapId, login)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
    }
    else {
      TM.addToJukebox(mapId, login)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} to the queue.`)
    }
  }

  private getRecordIndexString(login: string, mapId: string): string {
    // IDK IF I NEED TO SORT HERE NEED TO CHECK LATER
    const recordIndex = TM.records.filter(a => a.map === mapId).sort((a, b) => a.time - b.time).findIndex(a => a.login === login) + 1
    if (recordIndex === 0) { return "--." }
    else { return TM.Utils.getPositionString(recordIndex) }
  }

  private getActionId(mapId: string): number {
    const challengeActionId = this.challengeActionIds.indexOf(mapId)
    if (challengeActionId !== -1) { return challengeActionId + this.openId + MAP_ADD_ID }
    else {
      this.challengeActionIds.push(mapId)
      return this.challengeActionIds.length - 1 + this.openId + MAP_ADD_ID
    }
  }

  private getHeader(mapIndex: number, mapId: string, actionId: number, w: number, h: number): string {
    const width = (w - this.margin * 3) - this.iconW
    const height = h - this.margin
    const index = TM.jukebox.findIndex(a => a.id === mapId)
    if (index !== -1) {
      return `<quad posn="0 0 8" sizen="${w} ${h}" action="${actionId}"
           image="http://maniacdn.net/undef.de/uaseco/blank.png" 
           imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260325638154/plusek8.png"/>
          <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${ICONS.map.white}"/>
          <frame posn="${this.iconW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width - (this.margin + this.queuePositionW)} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`Map #${mapIndex + 1}`, width - (this.margin + this.queuePositionW), height / 4 - this.margin, { textScale: 0.6 })}
          </frame>
          <frame posn="${this.iconW + width + this.margin - this.queuePositionW} 0 1">
            <quad posn="0 0 3" sizen="${this.queuePositionW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`$0F0Queued (${TM.Utils.getPositionString(index + 1)})`, this.queuePositionW, height / 4 - this.margin, { textScale: 0.6 })}
          </frame>`
    }
    else {
      return `<quad posn="0 0 8" sizen="${w} ${h}" action="${actionId}"
           image="http://maniacdn.net/undef.de/uaseco/blank.png" 
           imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260325638154/minusek8.png"/>
          <quad posn="0 0 3" sizen="${this.iconW} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
          <quad posn="${this.margin} ${-this.margin} 4" sizen="${this.iconW - this.margin * 2} ${(height / 4) - this.margin * 3}" image="${ICONS.map.white}"/>
          <frame posn="${this.iconW + this.margin} 0 1">
            <quad posn="0 0 3" sizen="${width} ${height / 4 - this.margin}" bgcolor="${this.iconBg}"/>
            ${verticallyCenteredText(`Map #${mapIndex + 1}`, width, height / 4 - this.margin, { textScale: 0.6 })}
          </frame>`
    }
  }

} 