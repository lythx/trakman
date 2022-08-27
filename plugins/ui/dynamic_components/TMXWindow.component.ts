import PopupWindow from "../PopupWindow.js";
import { trakman as tm } from "../../../src/Trakman.js";
import { CONFIG, IDS, Grid, GridCellFunction, centeredText, closeButton, verticallyCenteredText, GridCellObject } from '../UiUtils.js'
import { Paginator } from "../UiUtils.js";
import config from './TMXWindow.config.js'
import { tmx } from "../../tmx/Tmx.js";

export default class TMXWindow extends PopupWindow<number> {

  private readonly paginator: Paginator
  private readonly grid: Grid
  private historyCount = 0

  constructor() {
    super(IDS.TMXWindow, config.icon, config.title, config.navbar)
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, Math.ceil(1 + config.queueCount / config.itemsPerPage))
    this.paginator.onPageChange = (login, page) => {
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
    this.grid = new Grid(this.contentWidth, this.contentHeight, new Array(config.itemsPerPage).fill(1), [1],
      { background: config.gridBackground, margin: CONFIG.grid.margin })
    tmx.onMapChange(() => this.reRender())
    tmx.onQueueChange(() => this.reRender())
    tm.addListener('Controller.BeginMap', () => {
      this.historyCount = Math.ceil((Math.min(config.historyCount, tm.jukebox.historyCount) - 1) / config.itemsPerPage)
      const nextCount = Math.ceil((config.queueCount - 1) / config.itemsPerPage)
      this.paginator.setPageCount(this.historyCount + 1 + nextCount)
      this.reRender()
    })
    tm.addListener('Controller.JukeboxChanged', () => this.reRender())
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen()
    for (const login of players) {
      const page = this.paginator.getPageByLogin(login)
      this.displayToPlayer(login, page, `${page}/${this.paginator.pageCount}`)
    }
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.displayToPlayer(info.login, this.historyCount + 1)
  }

  protected constructContent(login: string, page: number): string {
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
      titles = [`${config.titles.previous} #${index + 2}`, `${config.titles.previous} #${index + 1}`, `${config.titles.previous} #${index}`]
    } else {
      const index = Math.ceil((page - (currentPage + 1)) * config.itemsPerPage) + 1
      maps = [tm.jukebox.queue[index], tm.jukebox.queue?.[index + 1], tm.jukebox.queue?.[index + 2]]
      tmxMaps = [tmx.queue[index], tmx.queue?.[index + 1], tmx.queue?.[index + 2]]
      titles = [`${config.titles.next} #${index}`, `${config.titles.next} #${index + 1}`, `${config.titles.next} #${index + 2}`]
    }
    const cell: GridCellFunction = (i, j, w, h) => {
      const map = maps[j]
      if (map === undefined) { return '' }
      const grid = new Grid(w, h, [1], [1.1, 4.7, 1.1, 1.1, 4.2, 3.8, 1.8],
        { background: config.infosBackground, margin: CONFIG.grid.margin })
      const tmxMap = tmxMaps[j] ?? undefined
      const header: GridCellFunction = (ii, jj, ww, hh) => this.constructEntry(titles[j], config.icons.header, ww, hh, config.iconWidth)
      const screenshot: GridCellFunction = (ii, jj, ww, hh) => this.constructScreenshot(ww, hh, tmxMap)
      const name: GridCellFunction = (ii, jj, ww, hh) =>
        this.constructEntry(tm.utils.safeString(tm.utils.strip(map.name, false)), config.icons.name, ww, hh, config.iconWidth)
      const author: GridCellFunction = (ii, jj, ww, hh) =>
        this.constructEntry(tm.utils.safeString(map.author), config.icons.name, ww, hh, config.iconWidth)
      const infos: GridCellFunction = (ii, jj, ww, hh) => this.constructInfoXml(ww, hh, map, tmxMap)
      const tmxRecords: GridCellFunction = (ii, jj, ww, hh) => this.counstructTmxRecordsXml(ww, hh, tmxMap?.replays)
      return grid.constructXml([header, screenshot, name, author, infos, tmxRecords])
    }
    return `<format textsize="3"/>` + this.grid.constructXml(new Array(config.itemsPerPage).fill(null).map(() => cell))
  }

  protected constructFooter(login: string, page: number): string {
    return this.paginator.constructXml(page) + closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

  private constructEntry(text: string, image: string, width: number, height: number, iconWidth: number): string {
    return `<quad posn="${config.margin} ${-config.margin} 4" sizen="${iconWidth} ${height - config.margin * 2}" bgcolor="${config.iconBackground}"/>
      <quad posn="${config.margin * 2} ${-config.margin * 2} 6" sizen="${iconWidth - config.margin * 2} ${height - config.margin * 4}" image="${image}"/>
      <frame posn="${iconWidth + config.margin * 2} ${-config.margin} 4">
        <quad posn="0 0 3" sizen="${width - (iconWidth + config.margin * 3)} ${height - config.margin * 2}" bgcolor="${config.gridBackground}"/>
        ${verticallyCenteredText(text, width - (iconWidth + config.margin), height, { textScale: config.textscale })}
      </frame>`
  }

  protected constructScreenshot(width: number, height: number, tmxMap?: TMXMapInfo) {
    const image = tmxMap === undefined
      ? config.noScreenshot
      : tm.utils.safeString(tmxMap.thumbnailUrl + `&.jpeg`)
    return `<quad posn="${config.margin} ${-config.margin} 8" sizen="${config.screenshotWidth} ${height - config.margin * 2}" image="${image}"/>`
      + centeredText(config.notLoaded, config.screenshotWidth, height, { textScale: config.textscale })
  }

  private constructInfoXml(width: number, height: number, map: TMMap, tmxMap?: TMXMapInfo): string {
    const cols = 4
    const rows = 4
    const grid = new Grid(width, height, [1.3, 1.3, 1, 1], new Array(rows).fill(1),
      { margin: CONFIG.grid.margin })
    const infos: string[] = [
      tm.utils.getTimeString(map.authorTime),
      tm.utils.formatDate(map.addDate, true),
      tm.utils.getPositionString(1), // TODO FIX
      map.copperPrice.toString(),
      map.environment,
      map.mood,
      map.voteRatio.toString(),
      tmxMap?.style ?? config.defaultText,
      tmxMap?.difficulty ?? config.defaultText,
      tmxMap?.type ?? config.defaultText,
      tmxMap?.leaderboardRating.toString() ?? config.defaultText,
      tmxMap?.awards.toString() ?? config.defaultText,
      tmxMap?.routes ?? config.defaultText,
      tmxMap !== undefined ? tm.utils.formatDate(tmxMap.lastUpdateDate, true) : config.defaultText,
      tmxMap?.game ?? config.defaultText,
    ]
    const cell: GridCellFunction = (i, j, w, h) => {
      const index = (i * grid.columns) + j
      return `
      <quad posn="0 0 4" sizen="${config.infoIconWidth} ${h}" bgcolor="${config.iconBackground}"/>
      <quad posn="${config.margin} ${-config.margin} 6" sizen="${config.infoIconWidth - config.margin * 2} ${h - config.margin * 2}" image="${config.infoIcons?.[index] ?? ''}"/>
      <frame posn="${config.infoIconWidth + config.margin} 0 2">
        <quad posn="0 0 3" sizen="${w - (config.infoIconWidth + config.margin)} ${h}" bgcolor="${config.gridBackground}"/>
        ${centeredText(infos?.[index] ?? '', w - (config.infoIconWidth + config.margin), h, { textScale: config.infoTextscale })}
      </frame>`
    }
    return grid.constructXml(new Array(cols * rows).fill(null).map(() => cell))
  }

  private counstructTmxRecordsXml(width: number, height: number, replays: TMXReplay[] = []): string {
    const grid = new Grid(width, height, [1, 3, 2, 3, 1], new Array(config.tmxRecordCount + 1).fill(1),
      { margin: CONFIG.grid.margin, background: config.gridBackground, headerBg: config.iconBackground })
    const options = { textScale: config.recordTextScale }
    const arr: (GridCellFunction | GridCellObject)[] = [
      (i, j, w, h) => centeredText('Lp.', w, h, options),
      (i, j, w, h) => centeredText('Name', w, h, options),
      (i, j, w, h) => centeredText('Time', w, h, options),
      (i, j, w, h) => centeredText('Date', w, h, options),
      (i, j, w, h) => centeredText('Dl.', w, h, options),
    ]
    const indexCell: GridCellObject = {
      callback: (i, j, w, h) => centeredText(tm.utils.getPositionString(i), w, h, options),
      background: config.iconBackground
    }
    const nameCell: GridCellFunction = (i, j, w, h) =>
      verticallyCenteredText(tm.utils.safeString(replays[i - 1]?.name ?? config.defaultText), w, h, options)
    const timeCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.getTimeString(replays[i - 1]?.time) : config.defaultTime, w, h, options)
    const dateCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.formatDate(replays[i - 1]?.recordDate, true) : config.defaultText, w, h, options)
    const downloadCell: GridCellFunction = (i, j, w, h) => replays[i - 1] !== undefined ?
      `<quad posn="0 0 5" sizen="${w} ${h}" image="${config.icons.download}" url="${replays[i - 1].url.replace(/^https:\/\//, '')}"/>` :
      ''
    for (let i = 0; i < config.tmxRecordCount; i++) {
      arr.push(indexCell, nameCell, timeCell, dateCell, downloadCell)
    }
    return grid.constructXml(arr)
  }

  // private getTMXXml(tmxInfo: TMXTrackInfo | null) {
  //   if (tmxInfo === null) { return '' }
  //   let lbRating: string = tmxInfo.leaderboardRating.toString()
  //   let lbIcon = ICN.star.white
  //   if (tmxInfo.isClassic === true) {
  //     lbRating = 'Classic'
  //     lbIcon = ICN.star.yellow
  //   }
  //   if (tmxInfo.isNadeo === true) {
  //     lbRating = 'Nadeo'
  //     lbIcon = ICN.star.green
  //   }
  //   let tmxDiffImage: string
  //   switch (tmxInfo.difficulty) {
  //     case 'Beginner':
  //       tmxDiffImage = ICN.difficulty.beginner
  //       break
  //     case 'Intermediate':
  //       tmxDiffImage = ICN.difficulty.intermediate
  //       break
  //     case 'Expert':
  //       tmxDiffImage = ICN.difficulty.expert
  //       break
  //     case 'Lunatic':
  //       tmxDiffImage = ICN.difficulty.lunatic
  //       break
  //     default:
  //       tmxDiffImage = ICN.empty
  //   }
  //   return `
  //               <quad posn="0.4 -34.2 3" sizen="1.9 1.9"
  //                image="${ICN.mapQuestionMark}"/>
  //               <label posn="2.5 -34.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.type} "/>
  //               <quad posn="0.4 -36.2 3" sizen="1.9 1.9" image="${ICN.routes}"/>
  //               <label posn="2.5 -36.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.routes}"/>
  //               <quad posn="8 -32.2 3" sizen="1.9 1.9" image="${ICN.tag}"/>
  //               <label posn="10.1 -32.38 3" sizen="7.15 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.style}"/>
  //               <quad posn="8 -34.2 3" sizen="1.9 1.9" image="${tmxDiffImage}"/>
  //               <label posn="10.1 -34.38 3" sizen="7.15 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.difficulty}"/>
  //               <quad posn="8 -36.2 3" sizen="1.9 1.9" image="${ICN.tools}"/>
  //               <label posn="10.1 -36.38 3" sizen="7.15 2" scale="1"
  //                text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.lastUpdateDate.getDate().toString().padStart(2, '0')}/${(tmxInfo.lastUpdateDate.getMonth() + 1).toString().padStart(2, '0')}/${tmxInfo.lastUpdateDate.getFullYear()}"/>
  //               <quad posn="17.5 -32.2 3" sizen="1.9 1.9" image="${lbIcon}"/>
  //               <label posn="19.6 -32.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + lbRating}"/>
  //               <quad posn="17.5 -34.2 3" sizen="1.9 1.9" image="${ICN.trophy}"/>
  //               <label posn="19.6 -34.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.awards}"/>
  //               <quad posn="17.5 -36.2 3" sizen="1.9 1.9" image="${ICN.TM}"/>
  //               <label posn="19.6 -36.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.game}"/>
  //               <quad posn="6 -49.2 3" sizen="3.2 3.2" image="${ICN.mapDownload}"
  //                url="${tmxInfo.downloadUrl.replace(/^https:\/\//, '')}"/>
  //               <quad posn="11 -49.2 3" sizen="3.2 3.2" image="${ICN.lineGraph}"
  //                url="${tm.utils.safeString(`http://dedimania.net/tmstats/?do=stat&Uid=${tmxInfo.id}&Show=RECORDS`.replace(/^https:\/\//, ''))}"/>
  //               <quad posn="16 -49.2 3" sizen="3.2 3.2"
  //                image="${ICN.MX}"
  //                url="${tmxInfo.pageUrl.replace(/^https:\/\//, '')}"/>`
  // }

  // private getPositionString(login: string, challengeId: string): string {
  //   const recordIndex = tm.records.filter(a => a.challenge === challengeId).sort((a, b) => a.time - b.time).findIndex(a => a.login === login) + 1
  //   if (recordIndex === 0) { return "--." }
  //   else { return tm.utils.getPositionString(recordIndex) }
  // }

  // private getReplaysXml(tmxInfo: TMXTrackInfo | null): string {
  //   let replaysXml = `<quad posn="0.4 -39 2" sizen="24.2 9.8" style="BgsPlayerCard" substyle="BgCardSystem"/>
  //           <quad posn="5.55 -39.5 3" sizen="1.9 1.9"
  //            image="${ICN.account}"/>
  //           <quad posn="11.55 -39.5 3" sizen="1.9 1.9"
  //            image="${ICN.timer}"/>
  //           <quad posn="17.55 -39.5 3" sizen="1.9 1.9"
  //            image="${ICN.calendar}"/>`
  //   const positionIcons = [ICN.one, ICN.two, ICN.three]
  //   for (let i = 0; i < 3; i++) {
  //     const imgPos = -(41.7 + (2.3 * i))
  //     const txtPos = -(41.9 + (2.3 * i))
  //     if (tmxInfo !== null && tmxInfo.replays[i] !== undefined) {
  //       replaysXml += `
  //         <quad posn="0.9 ${imgPos} 3" sizen="1.9 1.9" image="${positionIcons[i]}"/>
  //         <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1"
  //          text="${CFG.widgetStyleRace.formattingCodes + tm.utils.safeString(tmxInfo.replays[i].name)}"/>
  //         <label posn="12.5 ${txtPos} 3" sizen="4 2" scale="1" halign="center"
  //          text="${CFG.widgetStyleRace.formattingCodes + tm.utils.getTimeString(tmxInfo.replays[i].time)}"/>
  //         <label posn="15.5 ${txtPos} 3" sizen="6.4 2" scale="1"
  //          text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.replays[i].recordDate.getDate().toString().padStart(2, '0')}/${(tmxInfo.replays[i].recordDate.getMonth() + 1).toString().padStart(2, '0')}/${tmxInfo.replays[i].recordDate.getFullYear()}"/>
  //         <quad posn="22.15 ${imgPos + 0.2} 3" sizen="1.9 1.9"
  //          image="${ICN.download}"
  //          url="${}"/>`
  //     }
  //     else {
  //       replaysXml += `
  //         <quad posn="0.9 ${imgPos} 3" sizen="1.9 1.9" image="${positionIcons[i]}"/>
  //         <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}N/A"/>
  //         <label posn="10 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}-:--.--"/>
  //         <label posn="15.5 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}--/--/----"/>`
  //     }
  //   }
  //   return replaysXml
  //}

} 