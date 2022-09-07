import PopupWindow from "../PopupWindow.js";
import { trakman as tm } from "../../../src/Trakman.js";
import { IDS, Grid, GridCellFunction, centeredText, closeButton, verticallyCenteredText, GridCellObject } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js";
import config from './MapInfoWindow.config.js'
import { tmx } from "../../tmx/Tmx.js";

// TODO FIX RECORDS BEING FETCHED EVERYTIME 

export default class TMXWindow extends PopupWindow<number> {

  private readonly paginator: Paginator
  private readonly grid: Grid
  private historyCount = 0

  constructor() {
    super(IDS.TMXWindow, config.icon, config.title, config.navbar)
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(config.queueCount / config.itemsPerPage))
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.itemsPerPage).fill(1), [1],
      { background: config.gridBackground, margin: config.margin })
    tmx.onMapChange(() => this.reRender())
    tmx.onQueueChange(() => this.reRender())
    tm.addListener('Controller.BeginMap', () => {
      this.historyCount = Math.ceil((Math.min(config.historyCount, tm.jukebox.historyCount) - 1) / config.itemsPerPage)
      const nextCount = Math.ceil((config.queueCount - 1) / config.itemsPerPage)
      this.paginator.setPageCount(this.historyCount + 1 + nextCount)
      this.reRender()
    })
    tm.addListener('Controller.JukeboxChanged', () => this.reRender())
    tm.commands.add({
      aliases: ['tmxinfo'],
      help: 'Display TMX info.',
      callback: (info: TMMessageInfo): void =>  tm.openManialink(this.openId, info.login),
      privilege: 0
    },)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
  }

  protected onOpen(info: ManialinkClickInfo): void {
    const page = this.historyCount + 1
    this.displayToPlayer(info.login, page, `${page}/${this.paginator.pageCount}`)
  }

  protected async constructContent(login: string, page: number): Promise<string> {
    const historyCount = Math.min(config.historyCount, tm.jukebox.historyCount)
    let maps: (TMMap | undefined)[]
    let tmxMaps: (TMXMapInfo | null | undefined)[]
    let titles: string[]
    const currentPage = Math.ceil((historyCount - 1) / config.itemsPerPage) + 1
    if (currentPage === page) {
      maps = [tm.jukebox?.history[0], tm.maps.current, tm.jukebox?.queue[0]]
      tmxMaps = [tmx.history[0], tmx.current, tmx.queue[0]]
      titles = [`${config.titles.previous} #1`, config.titles.current, `${config.titles.next} #1`]
    } else if (currentPage > page) {
      const index = Math.ceil((currentPage - (page + 1)) * config.itemsPerPage) + 1
      maps = [tm.jukebox.history[index + 2], tm.jukebox.history?.[index + 1], tm.jukebox.history?.[index]]
      tmxMaps = [tmx.history[index + 2], tmx.history?.[index + 1], tmx.history?.[index]]
      titles = [`${config.titles.previous} #${index + 3}`, `${config.titles.previous} #${index + 2}`, `${config.titles.previous} #${index + 1}`]
    } else {
      const index = Math.ceil((page - (currentPage + 1)) * config.itemsPerPage) + 1
      maps = [tm.jukebox.queue[index], tm.jukebox.queue?.[index + 1], tm.jukebox.queue?.[index + 2]]
      tmxMaps = [tmx.queue[index], tmx.queue?.[index + 1], tmx.queue?.[index + 2]]
      titles = [`${config.titles.next} #${index + 1}`, `${config.titles.next} #${index + 2}`, `${config.titles.next} #${index + 3}`]
    }
    const allRecords = await tm.records.fetchByMap(...maps.filter(a => a !== undefined).map(a => (a as any).id))
    const cell: GridCellFunction = (i, j, w, h) => {
      const map = maps[j]
      if (map === undefined) { return '' }
      const grid = new Grid(w, h, [1], config.gridRows,
        { background: config.info.background, margin: config.margin })
      const tmxMap = tmxMaps[j] ?? undefined
      const mapRecords = allRecords.filter(a => a.map === map.id)
      const header: GridCellFunction = (ii, jj, ww, hh) => this.constructHeader(ww, hh, titles[j], map, tmxMap)
      const screenshot: GridCellFunction = (ii, jj, ww, hh) => this.constructScreenshot(login, ww, hh, mapRecords, tmxMap)
      const name: GridCellFunction = (ii, jj, ww, hh) =>
        this.constructEntry(tm.utils.safeString(tm.utils.strip(map.name, false)), config.icons.name, ww, hh, config.iconWidth)
      const author: GridCellFunction = (ii, jj, ww, hh) => this.constructAuthor(ww, hh, map)
      const infos: GridCellFunction = (ii, jj, ww, hh) =>
        this.constructInfoXml(ww, hh, map, tmxMap)
      const tmxRecords: GridCellFunction = (ii, jj, ww, hh) => this.counstructTmxRecordsXml(ww, hh, tmxMap?.replays)
      return grid.constructXml([header, screenshot, name, author, infos, tmxRecords])
    }
    return `<format textsize="3"/>` + this.grid.constructXml(new Array(config.itemsPerPage).fill(null).map(() => cell))
  }

  protected constructFooter(login: string, page: number): string {
    return this.paginator.constructXml(page) + closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

  private constructHeader(width: number, height: number, title: string, map: TMMap, tmxMap?: TMXMapInfo): string {
    const icon = (x: number, y: number, image: string, url: string): string => {
      return `<quad posn="${x + config.margin} ${-(y + config.margin)} 3" 
       sizen="${config.iconWidth} ${height - config.margin * 2}" bgcolor="${config.iconBackground}" url="${url}"/>
      <quad posn="${x + config.margin * 2} ${-(y + config.margin * 2)} 5" 
       sizen="${config.iconWidth - config.margin * 2} ${height - config.margin * 4}" 
       image="${image}" url="${url}"/>`
    }
    if (tmxMap === undefined) {
      return `${this.constructEntry(title, config.icons.header, width - (config.iconWidth + config.margin), height, config.iconWidth)}
        <frame posn="${width - (config.iconWidth + config.margin * 2)} 0 4">
          ${icon(0, 0, config.icons.dedimania, tm.utils.safeString(`dedimania.net/tmstats/?do=stat&Uid=${map.id}&Show=RECORDS`))}
        </frame>`
    }
    return `${this.constructEntry(title, config.icons.header, width - (config.iconWidth + config.margin) * 3, height, config.iconWidth)}
    <frame posn="${width - ((config.iconWidth + config.margin) * 3 + config.margin)} 0 4">
      ${icon(0, 0, config.icons.maniaExchange, tmxMap.pageUrl.replace(/^https:\/\//, ''))}
      ${icon(config.iconWidth + config.margin, 0, config.icons.downloadGreen, tmxMap.downloadUrl.replace(/^https:\/\//, ''))}
      ${icon((config.iconWidth + config.margin) * 2, 0, config.icons.dedimania, tm.utils.safeString(`dedimania.net/tmstats/?do=stat&Uid=${map.id}&Show=RECORDS`))}
    </frame>`
  }

  private constructEntry(text: string, image: string, width: number, height: number, iconWidth: number, useCenteredText?: true): string {
    return `<quad posn="${config.margin} ${-config.margin} 4" sizen="${iconWidth} ${height - config.margin * 2}" bgcolor="${config.iconBackground}"/>
      <quad posn="${config.margin * 2} ${-config.margin * 2} 6" sizen="${iconWidth - config.margin * 2} ${height - config.margin * 4}" image="${image}"/>
      <frame posn="${iconWidth + config.margin * 2} ${-config.margin} 4">
        <quad posn="0 0 3" sizen="${width - (iconWidth + config.margin * 3)} ${height - config.margin * 2}" bgcolor="${config.gridBackground}"/>
        ${useCenteredText === true ? centeredText(text, width - (iconWidth + config.margin * 3), height - config.margin * 2, { textScale: config.textscale }) :
        verticallyCenteredText(text, width - (iconWidth + config.margin * 3), height - config.margin * 2, { textScale: config.textscale })}
      </frame>`
  }

  protected constructScreenshot(login: string, width: number, height: number, records: TMRecord[], tmxMap?: TMXMapInfo) {
    const rightW = width - (config.screenshotWidth + config.margin)
    const count = config.localsCount
    const grid = new Grid(rightW, height, [1, 2, 3], new Array(count + 1).fill(1),
      { headerBackground: config.iconBackground, background: config.gridBackground, margin: config.margin })
    const options = { textScale: config.recordTextScale }
    const index = records.findIndex(a => a.login === login)
    let personalIndex: number | undefined
    const personalRecord = records[index]
    records = records.slice(0, count)
    if (personalRecord !== undefined && index >= count) {
      records[count - 1] = personalRecord
      personalIndex = count
    }
    const indexCell: GridCellObject = {
      callback: (i, j, w, h) => {
        return centeredText(personalIndex === i ? (index + 1).toString() : (records[i - 1] === undefined ? config.defaultText : i.toString()), w, h, options)
      },
      background: config.iconBackground
    }
    const nameCell: GridCellFunction = (i, j, w, h) => {
      let nickname: string | undefined = records[i - 1]?.nickname
      if (((records[i - 1] === undefined && i === 1) || (records[i - 1] === undefined && records[i - 2] !== undefined)) &&
        (index > count || index === -1)) {
        nickname = tm.players.get(login)?.nickname
      }
      return verticallyCenteredText(tm.utils.safeString(tm.utils.strip(nickname ?? config.defaultText, false)), w, h, options)
    }
    const timeCell: GridCellFunction = (i, j, w, h) => centeredText(records[i - 1] !== undefined ?
      tm.utils.getTimeString(records[i - 1]?.time) : config.defaultTime, w, h, options)
    const arr: (GridCellFunction | GridCellObject)[] = [
      (i, j, w, h) => centeredText('Lp.', w, h, options),
      (i, j, w, h) => centeredText('Time', w, h, options),
      (i, j, w, h) => centeredText('Name', w, h, options)
    ]
    for (let i = 0; i < count; i++) {
      arr.push(indexCell, timeCell, nameCell)
    }
    const image = tmxMap === undefined
      ? config.noScreenshot
      : tm.utils.safeString(tmxMap.thumbnailUrl + `&.jpeg`)
    return `<quad posn="${config.margin} ${-config.margin} 8" sizen="${config.screenshotWidth} ${height - config.margin * 2}" image="${image}"/>
      ${centeredText(config.notLoaded, config.screenshotWidth, height, { textScale: config.notLoadedTextscale, yOffset: -1 })}
      <frame posn="${config.margin + config.screenshotWidth} 0">
        ${grid.constructXml(arr)}
      </frame>`
  }

  protected constructAuthor(width: number, height: number, map: TMMap): string {
    return `${this.constructEntry(tm.utils.safeString(map.author), config.icons.author, width - config.authorTimeWidth, height, config.iconWidth)}
    <frame posn="${width - (config.authorTimeWidth + config.margin)} 0 4">
      ${this.constructEntry(tm.utils.getTimeString(map.authorTime), config.icons.authorTime, config.authorTimeWidth + config.margin, height, config.iconWidth, true)}
    </frame>`
  }

  private constructInfoXml(width: number, height: number, map: TMMap, tmxMap?: TMXMapInfo): string {
    const grid = new Grid(width, height, config.info.columnsProportions, new Array(config.info.rows).fill(1),
      { margin: config.margin })
    const ic = config.icons
    let lbIcon = ic.leaderboardRating.normal
    let lbRating = (tmxMap?.leaderboardRating?.toString() ?? map?.leaderboardRating?.toString()) ?? config.defaultText
    if (tmxMap?.isNadeo ?? map?.leaderboardRating === 50000) {
      lbRating = 'Nadeo'
      lbIcon = ic.leaderboardRating.nadeo
    }
    else if (tmxMap?.isClassic ?? map?.leaderboardRating === 0) { // TODO add isclassic and isnadeo to map obj perhaps
      lbRating = 'Classic'
      lbIcon = ic.leaderboardRating.classic
    }
    let awardsIcon = ic.awards.normal
    if (lbRating === 'Nadeo') { awardsIcon = ic.awards.nadeo }
    else if (lbRating === 'Classic') { awardsIcon = ic.awards.classic }
    const infos: [string, string][] = [
      [map.mood, ic.mood[map.mood.toLowerCase() as keyof typeof ic.mood]],
      [tm.utils.formatDate(map.addDate, true), ic.addDate],
      [map.voteRatio.toFixed(0), ic.voteRatio],
      [map.copperPrice.toString(), ic.copperPrice],
      [map.environment, ic.environment],
      [map?.checkpointsAmount !== undefined ? `${map.checkpointsAmount} CPs` : config.defaultText, ic.checkpointsAmount],
      [map.voteCount.toString(), ic.voteCount],
      [(tmxMap?.awards?.toString() ?? map?.awards?.toString()) ?? config.defaultText, awardsIcon],
      [tmxMap?.author ?? config.defaultText, ic.tmxAuthor],
      [tmxMap !== undefined ? tm.utils.formatDate(tmxMap.lastUpdateDate, true) : config.defaultText, ic.buildDate],
      [tmxMap?.style ?? config.defaultText, ic.style],
      [lbRating, lbIcon],
      [tmxMap?.difficulty ?? config.defaultText, ic.difficulty[(tmxMap?.difficulty?.toLowerCase() as keyof typeof ic.difficulty) ?? 'beginner']],
      [tmxMap?.routes ?? config.defaultText, ic.routes],
      [tmxMap?.type ?? config.defaultText, ic.type],
      [tmxMap?.game ?? config.defaultText, ic.game]
    ]
    const cell: GridCellFunction = (i, j, w, h) => {
      const index = (i * grid.columns) + j
      return `
      <quad posn="0 0 4" sizen="${config.info.iconWidth} ${h}" bgcolor="${config.iconBackground}"/>
      <quad posn="${config.margin} ${-config.margin} 6" sizen="${config.info.iconWidth - config.margin * 2} ${h - config.margin * 2}" image="${infos?.[index]?.[1] ?? ''}"/>
      <frame posn="${config.info.iconWidth + config.margin} 0 2">
        <quad posn="0 0 3" sizen="${w - (config.info.iconWidth + config.margin)} ${h}" bgcolor="${config.gridBackground}"/>
        ${centeredText(infos?.[index]?.[0] ?? '', w - (config.info.iconWidth + config.margin), h, { textScale: config.info.textscale })}
      </frame>`
    }
    return grid.constructXml(new Array(config.info.columnsProportions.length * config.info.rows).fill(null).map(() => cell))
  }

  private counstructTmxRecordsXml(width: number, height: number, replays: TMXReplay[] = []): string {
    const grid = new Grid(width, height, config.tmxColumns, new Array(config.tmxRecordCount + 1).fill(1),
      { margin: config.margin, background: config.gridBackground, headerBackground: config.iconBackground })
    const options = { textScale: config.recordTextScale }
    const arr: (GridCellFunction | GridCellObject)[] = [
      (i, j, w, h) => centeredText('Lp.', w, h, options),
      (i, j, w, h) => centeredText('Time', w, h, options),
      (i, j, w, h) => centeredText('Name', w, h, options),
      (i, j, w, h) => centeredText('Date', w, h, options),
      (i, j, w, h) => centeredText('Dl.', w, h, options),
    ]
    const indexCell: GridCellObject = {
      callback: (i, j, w, h) => centeredText(i.toString(), w, h, options),
      background: config.iconBackground
    }
    const timeCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.getTimeString(replays[i - 1]?.time) : config.defaultTime, w, h, options)
    const nameCell: GridCellFunction = (i, j, w, h) =>
      verticallyCenteredText(tm.utils.safeString(replays[i - 1]?.name ?? config.defaultText), w, h, options)
    const dateCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.formatDate(replays[i - 1]?.recordDate, true) : config.defaultText, w, h, options)
    const downloadCell: GridCellObject = {
      callback: (i, j, w, h) => replays[i - 1] !== undefined ?
        `<quad posn="${config.margin} ${-config.margin} 5" sizen="${w - config.margin * 2} ${h - config.margin * 2}" 
      image="${config.icons.download}" url="${replays[i - 1].url.replace(/^https:\/\//, '')}"
      imagefocus="${config.icons.downloadGreen}"/>` : '',
      background: config.iconBackground
    }
    for (let i = 0; i < config.tmxRecordCount; i++) {
      arr.push(indexCell, timeCell, nameCell, dateCell, downloadCell)
    }
    return grid.constructXml(arr)
  }

} 