import PopupWindow from "../PopupWindow.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import { closeButton, CONFIG, Grid, ICONS, IDS, stringToObjectProperty } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js";

const MAP_ADD_ID = 1000
// TODO CHANGE SO IT USES GRID
// TODO HANDLE CHALLENGE LIST LENGTH UPDATES
export default class MapList extends PopupWindow {

  readonly columns = CONFIG.mapList.columns
  readonly rows = CONFIG.mapList.rows
  private readonly paginator: Paginator
  private readonly mapAddId = MAP_ADD_ID
  private readonly grid: Grid
  private readonly format = CONFIG.static.format
  private readonly challengeActionIds: string[] = []
  private readonly headerBackground = '000C'
  private readonly headerJukedBg = 'FFFF'

  constructor() {
    super(IDS.mapList, stringToObjectProperty(CONFIG.mapList.icon, ICONS), CONFIG.mapList.title, CONFIG.mapList.navbar)
    const pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, pageCount)
    this.paginator.onPageChange((login: string, page: number) => {
      let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
      if (pageCount === 0) { pageCount++ }
      this.paginator.updatePageCount(pageCount)
      this.displayToPlayer(login, page, `${page}/${pageCount}`)
    })
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(this.columns).fill(1), new Array(this.rows).fill(1),
      { background: CONFIG.grid.bg, margin: CONFIG.grid.margin })
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer >= this.openId + this.mapAddId && info.answer <= this.openId + this.mapAddId + 5000) {
        const challengeId = this.challengeActionIds[info.answer - (this.openId + this.mapAddId)]
        if (challengeId === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
          TM.error('Error while adding map to queue from jukebox', `Challenge index out of range`)
          return
        }
        this.handleMapClick(challengeId, info.login, info.nickName)
        const page = this.paginator.getPageByLogin(info.login)
        let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
        if (pageCount === 0) { pageCount++ }
        if (page === undefined) {
          this.displayToPlayer(info.login, 1, `1/${pageCount}`)
          return
        }
        this.paginator.updatePageCount(pageCount)
        this.displayToPlayer(info.login, page, `${page}/${pageCount}`)
      }
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.paginator.getPageByLogin(info.login)
    let pageCount = Math.ceil(TM.maps.length / (this.rows * this.columns))
    if (pageCount === 0) { pageCount++ }
    if (page === undefined) {
      this.displayToPlayer(info.login, 1, `1/${pageCount}`)
      return
    }
    this.paginator.updatePageCount(pageCount)
    this.displayToPlayer(info.login, page, `${page}/${pageCount}`)
  }

  protected constructContent(login: string, page: number): string {
    const challenges = [...TM.maps]
    //TODO USE CHALLENGELISTUPDATE EVENT OR SOMETHING CUZ THIS IS GIGA INEFFECTIVE
    challenges.sort((a, b) => a.name.localeCompare(b.name))
    challenges.sort((a, b) => a.author.localeCompare(b.author))
    let trackIndex = (this.rows * this.columns) * (page - 1)
    const tracksToDisplay = challenges.length - (trackIndex + 1)
    const cell = (i: number, j: number, w: number, h: number) => {
      const recordIndexString = this.getRecordIndexString(login, challenges[trackIndex].id)
      const actionId = this.getActionId(challenges[trackIndex].id)
      const header = this.getHeader(challenges[trackIndex].id, actionId, w, h)
      trackIndex++
      return `
        ${header}
        <format textsize="1.3" textcolor="FFFF"/>
        <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${this.format}Map #${trackIndex}"/>
        <label posn="0.7 -3.1 3" sizen="13 2" scale="1" text="${this.format + TM.safeString(TM.strip(challenges[trackIndex].name, false))}"/>
        <label posn="0.7 -5.3 3" sizen="13 2" scale="0.9" text="${this.format}by ${TM.safeString(challenges[trackIndex].author)}"/>
        <format textsize="1" textcolor="FFFF"/>
        <quad posn="0.4 -7.6 3" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>
        <label posn="2.1 -7.9 3" sizen="4.4 2" scale="0.75" text="${this.format + TM.Utils.getTimeString(challenges[trackIndex].authorTime)}"/>
        <quad posn="5.7 -7.5 3" sizen="1.9 1.9" style="BgRaceScore2" substyle="LadderRank"/>
        <label posn="7.5 -7.9 3" sizen="3 2" scale="0.75" text="${this.format + recordIndexString}"/>
        <quad posn="10.2 -7.4 3" sizen="1.9 1.9" style="Icons64x64_1" substyle="StateFavourite"/>
        <label posn="12.1 -7.9 3" sizen="3 2" scale="0.75" text="${this.format}100"/>`
    }
    return this.grid.constructXml(new Array(tracksToDisplay).fill(cell))
  }

  protected constructFooter(login: string, page: number): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(page)
  }

  private handleMapClick(mapId: string, login: string, nickName: string) {
    const challenge = TM.maps.find(a => a.id === mapId)
    if (challenge === undefined) {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, login)
      TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${mapId} in memory`)
      return
    }
    if (TM.jukebox.some(a => a.id === mapId)) {
      TM.removeFromJukebox(mapId)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
        + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
    }
    else {
      TM.addToJukebox(mapId)
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

  private getHeader(mapId: string, actionId: number, w: number, h: number): string {
    if (TM.jukebox.some(a => a.id === mapId)) {
      return `<quad posn="${this.grid.margin} ${-this.grid.margin} 4" sizen="${w - this.grid.margin * 2} ${h - this.grid.margin * 2}" action="${actionId}"
          image="http://maniacdn.net/undef.de/uaseco/blank.png" 
          imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260325638154/minusek8.png"/>
          <quad posn="${this.grid.margin + this.margin} ${-this.grid.margin - this.margin} 2" sizen="${w - this.margin * 2} 2" bgcolor="${this.headerJukedBg}"/>`
    }
    else {
      return `<quad posn="${this.grid.margin} ${-this.grid.margin} 4" sizen="${w - this.grid.margin * 2} ${h - this.grid.margin * 2}" action="${actionId}"
          image="http://maniacdn.net/undef.de/uaseco/blank.png" 
          imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260547911740/plusek8.png"/>
          <quad posn="${w / 2} ${-this.margin} 3" sizen="${w - this.margin * 2} 2" bgcolor="${this.headerBackground}" halign="center"/>`
    }
  }

} 