/**
 * @author lythx
 * @since 0.5
 */

import { componentIds, Paginator, Grid, GridCellFunction, centeredText, closeButton, leftAlignedText, GridCellObject, PopupWindow } from '../../ui/UI.js'
import config from './TMXWindow.config.js'
import { tmx } from "../../tmx/Tmx.js"

class TMXWindow extends PopupWindow<number> {

  private readonly paginator: Paginator
  private readonly grid: Grid
  private historyCount = 0

  constructor() {
    super(componentIds.TMXWindow, config.icon, config.title, config.navbar)
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(config.queueCount / config.itemsPerPage))
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.itemsPerPage).fill(1), [1],
      { background: config.gridBackground, margin: config.margin })
    tmx.onMapChange(() => this.reRender())
    tmx.onQueueChange(() => this.reRender())
    tm.addListener('BeginMap', () => {
      this.historyCount = Math.ceil((Math.min(config.historyCount, tm.jukebox.historyCount) - 1) / config.itemsPerPage)
      const nextCount = Math.ceil((config.queueCount - 1) / config.itemsPerPage)
      this.paginator.setPageCount(this.historyCount + 1 + nextCount)
      this.reRender()
    })
    tm.addListener('RecordsPrefetch', () => this.reRender())
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info: tm.MessageInfo): void => tm.openManialink(this.openId, info.login),
      privilege: config.command.privilege
    })
    tm.addListener('PlayerDataUpdated', () => this.reRender())
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
  }

  protected onOpen(info: tm.ManialinkClickInfo): void {
    const page = this.historyCount + 1
    this.displayToPlayer(info.login, page, `${page}/${this.paginator.pageCount}`)
  }

  protected constructContent(login: string, page: number): string {
    const historyCount = Math.min(config.historyCount, tm.jukebox.historyCount)
    let maps: (tm.Map | undefined)[]
    let TMXMaps: (tm.TMXMap | null | undefined)[]
    let titles: string[]
    const currentPage = Math.ceil((historyCount - 1) / config.itemsPerPage) + 1
    if (currentPage === page) {
      maps = [tm.jukebox.history?.[0], tm.maps.current, tm.jukebox.queue?.[0]]
      TMXMaps = [tmx.history?.[0], tmx.current, tmx.queue?.[0]]
      titles = [`${config.titles.previous} #1`, config.titles.current, `${config.titles.next} #1`]
    } else if (currentPage > page) {
      const index = Math.ceil((currentPage - (page + 1)) * config.itemsPerPage) + 1
      maps = [tm.jukebox.history?.[index + 2], tm.jukebox.history?.[index + 1], tm.jukebox.history?.[index]]
      TMXMaps = [tmx.history?.[index + 2], tmx.history?.[index + 1], tmx.history?.[index]]
      titles = [`${config.titles.previous} #${index + 3} `, `${config.titles.previous} #${index + 2} `, `${config.titles.previous} #${index + 1} `]
    } else {
      const index = Math.ceil((page - (currentPage + 1)) * config.itemsPerPage) + 1
      maps = [tm.jukebox.queue?.[index], tm.jukebox.queue?.[index + 1], tm.jukebox.queue?.[index + 2]]
      TMXMaps = [tmx.queue?.[index], tmx.queue?.[index + 1], tmx.queue?.[index + 2]]
      titles = [`${config.titles.next} #${index + 1} `, `${config.titles.next} #${index + 2} `, `${config.titles.next} #${index + 3} `]
    }
    const m = maps.filter(a => a !== undefined).map(a => (a as any).id)
    const allRecords: Readonly<tm.Record[]> = [...tm.records.getFromHistory(...m), ...tm.records.local, ...tm.records.getFromQueue(...m)]
      .sort((a, b) => a.time - b.time)
      .filter((a, i, arr) => arr.findIndex(b => b.login === a.login && a.map === b.map) === i)
    const cell: GridCellFunction = (i, j, w, h) => {
      const map = maps[j]
      if (map === undefined) { return '' }
      const grid = new Grid(w, h, [1], config.gridRows,
        { background: config.info.background, margin: config.margin })
      let mapName = map.name
      if (tm.utils.isMultibyte(mapName)) {
        mapName = ''
      }
      const TMXMap = TMXMaps[j] ?? undefined
      const mapRecords = allRecords.filter(a => a.map === map.id)
      const header: GridCellFunction = (ii, jj, ww, hh) => this.constructHeader(ww, hh, titles[j], map, TMXMap)
      const screenshot: GridCellFunction = (ii, jj, ww, hh) => this.constructScreenshot(login, ww, hh, mapRecords, TMXMap)
      const name: GridCellFunction = (ii, jj, ww, hh) =>
        this.constructEntry(tm.utils.safeString(tm.utils.strip(mapName, false)), config.icons.name, ww, hh, config.iconWidth)
      const author: GridCellFunction = (ii, jj, ww, hh) => this.constructAuthor(ww, hh, map)
      const infos: GridCellFunction = (ii, jj, ww, hh) =>
        this.constructInfoXml(ww, hh, map, TMXMap)
      const tmxRecords: GridCellFunction = (ii, jj, ww, hh) => this.counstructTmxRecordsXml(ww, hh, TMXMap?.validReplays)
      return grid.constructXml([header, screenshot, name, author, infos, tmxRecords])
    }
    return `<format textsize="3" /> ` + this.grid.constructXml(new Array(config.itemsPerPage).fill(null).map(() => cell))
  }

  protected constructFooter(login: string, page: number): string {
    return this.paginator.constructXml(page) + closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

  private constructHeader(width: number, height: number, title: string, map: tm.Map, TMXMap?: tm.TMXMap): string {
    const icon = (x: number, y: number, image: string, url: string): string => {
      return `<quad posn="${x + config.margin} ${-(y + config.margin)} 3"
sizen="${config.iconWidth} ${height - config.margin * 2}" bgcolor="${config.iconBackground}" url="${url}" />
  <quad posn="${x + config.margin * 2} ${-(y + config.margin * 2)} 5"
sizen="${config.iconWidth - config.margin * 2} ${height - config.margin * 4}"
image="${image}" url="${url}" /> `
    }
    if (TMXMap === undefined) {
      return `${this.constructEntry(title, config.icons.header, width - (config.iconWidth + config.margin), height, config.iconWidth)}
<frame posn="${width - (config.iconWidth + config.margin * 2)} 0 4" >
  ${icon(0, 0, config.icons.dedimania, tm.utils.safeString(`dedimania.net/tmstats/?do=stat&Uid=${map.id}&Show=RECORDS`))}
</frame>`
    }
    return `${this.constructEntry(title, config.icons.header, width - (config.iconWidth + config.margin) * 3, height, config.iconWidth)}
    <frame posn="${width - ((config.iconWidth + config.margin) * 3 + config.margin)} 0 4">
      ${icon(0, 0, config.icons.maniaExchange, tm.utils.fixProtocol(TMXMap.pageUrl))}
      ${icon(config.iconWidth + config.margin, 0, config.icons.downloadGreen, tm.utils.fixProtocol(TMXMap.downloadUrl))}
      ${icon((config.iconWidth + config.margin) * 2, 0, config.icons.dedimania, tm.utils.safeString(`dedimania.net/tmstats/?do=stat&Uid=${map.id}&Show=RECORDS`))}
    </frame>`
  }

  private constructEntry(text: string, image: string, width: number, height: number, iconWidth: number, useCenteredText?: true): string {
    return `<quad posn="${config.margin} ${-config.margin} 4" sizen="${iconWidth} ${height - config.margin * 2}" bgcolor="${config.iconBackground}"/>
      <quad posn="${config.margin * 2} ${-config.margin * 2} 6" sizen="${iconWidth - config.margin * 2} ${height - config.margin * 4}" image="${image}"/>
      <frame posn="${iconWidth + config.margin * 2} ${-config.margin} 4">
        <quad posn="0 0 3" sizen="${width - (iconWidth + config.margin * 3)} ${height - config.margin * 2}" bgcolor="${config.gridBackground}"/>
        ${useCenteredText === true ? centeredText(text, width - (iconWidth + config.margin * 3), height - config.margin * 2, { textScale: config.textscale }) :
        leftAlignedText(text, width - (iconWidth + config.margin * 3), height - config.margin * 2, { textScale: config.textscale })}
      </frame>`
  }

  protected constructScreenshot(login: string, width: number, height: number, records: tm.Record[], TMXMap?: tm.TMXMap) {
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
      return leftAlignedText(tm.utils.safeString(tm.utils.strip(nickname ?? config.defaultText, false)), w, h, options)
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
    const image = TMXMap === undefined
      ? config.noScreenshot
      : tm.utils.safeString(TMXMap.thumbnailUrl + `&.jpeg`)
    return `<quad posn="${config.margin} ${-config.margin} 8" sizen="${config.screenshotWidth} ${height - config.margin * 2}" image="${image}"/>
      ${centeredText(config.notLoaded, config.screenshotWidth, height, { textScale: config.notLoadedTextscale, yOffset: -1 })}
      <frame posn="${config.margin + config.screenshotWidth} 0">
        ${grid.constructXml(arr)}
      </frame>`
  }

  protected constructAuthor(width: number, height: number, map: tm.Map): string {
    let author = map.author
    if (tm.utils.isMultibyte(author)) {
      author = ''
    }
    return `${this.constructEntry(tm.utils.safeString(author), config.icons.author, width - config.authorTimeWidth, height, config.iconWidth)}
    <frame posn="${width - (config.authorTimeWidth + config.margin)} 0 4">
      ${this.constructEntry(tm.utils.getTimeString(map.authorTime), config.icons.authorTime, config.authorTimeWidth + config.margin, height, config.iconWidth, true)}
    </frame>`
  }

  private constructInfoXml(width: number, height: number, map: tm.Map, TMXMap?: tm.TMXMap): string {
    const grid = new Grid(width, height, config.info.columnsProportions, new Array(config.info.rows).fill(1),
      { margin: config.margin })
    const ic = config.icons
    let lbIcon = ic.leaderboardRating.normal
    let lbRating = (TMXMap?.leaderboardRating?.toString() ?? map?.leaderboardRating?.toString()) ?? config.defaultText
    if (TMXMap?.isNadeo ?? map?.leaderboardRating === 50000) {
      lbRating = 'Nadeo'
      lbIcon = ic.leaderboardRating.nadeo
    }
    else if (map.isClassic) {
      lbRating = 'Classic'
      lbIcon = ic.leaderboardRating.classic
    }
    let awardsIcon = ic.awards.normal
    if (lbRating === 'Nadeo') { awardsIcon = ic.awards.nadeo }
    else if (lbRating === 'Classic') { awardsIcon = ic.awards.classic }
    const infos: [string, string][] = [
      [map.mood, ic.mood[map.mood.toLowerCase() as keyof typeof ic.mood]],
      [tm.utils.formatDate(map.addDate, true), ic.addDate],
      [map.voteRatio === -1 ? config.defaultText : map.voteRatio.toFixed(0), ic.voteRatio],
      [map.copperPrice.toString(), ic.copperPrice],
      [map.environment, ic.environment],
      [map?.checkpointsPerLap !== undefined ? `${map.checkpointsPerLap - 1} CPs` : config.defaultText, ic.checkpointsAmount],
      [map.voteCount.toString(), ic.voteCount],
      [(TMXMap?.awards?.toString() ?? map?.awards?.toString()) ?? config.defaultText, awardsIcon],
      [TMXMap?.author === undefined ? config.defaultText :
        (tm.utils.isMultibyte(TMXMap.author) ? '' : tm.utils.safeString(TMXMap.author)), ic.tmxAuthor],
      [TMXMap !== undefined ? tm.utils.formatDate(TMXMap.lastUpdateDate, true) : config.defaultText, ic.buildDate],
      [TMXMap?.style ?? config.defaultText, ic.style],
      [lbRating, lbIcon],
      [TMXMap?.difficulty ?? config.defaultText, ic.difficulty[(TMXMap?.difficulty?.toLowerCase() as keyof typeof ic.difficulty) ?? 'beginner']],
      [TMXMap?.routes ?? config.defaultText, ic.routes],
      [TMXMap?.type ?? config.defaultText, ic.type],
      [TMXMap?.game ?? config.defaultText, ic.game]
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

  private counstructTmxRecordsXml(width: number, height: number, replays: tm.TMXReplay[] = []): string {
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
      leftAlignedText(tm.utils.safeString(replays[i - 1]?.name ?? config.defaultText), w, h, options)
    const dateCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.formatDate(replays[i - 1]?.recordDate, true) : config.defaultText, w, h, options)
    const downloadCell: GridCellObject = {
      callback: (i, j, w, h) => replays[i - 1] !== undefined ?
        `<quad posn="${config.margin} ${-config.margin} 5" sizen="${w - config.margin * 2} ${h - config.margin * 2}" 
      image="${config.icons.download}" url="${tm.utils.fixProtocol(replays[i - 1].url)}"
      imagefocus="${config.icons.downloadGreen}"/>` : '',
      background: config.iconBackground
    }
    for (let i = 0; i < config.tmxRecordCount; i++) {
      arr.push(indexCell, timeCell, nameCell, dateCell, downloadCell)
    }
    return grid.constructXml(arr)
  }

}

tm.addListener('Startup', () => {
  new TMXWindow()
})
