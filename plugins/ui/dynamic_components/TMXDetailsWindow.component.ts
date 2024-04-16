/** 
 * @author wiseraven
 * @since 1.3.3
 */

import { componentIds, Grid, type GridCellFunction, centeredText, closeButton, leftAlignedText, type GridCellObject, PopupWindow } from '../../ui/UI.js'
import config from './TMXDetailsWindow.config.js'
import { tmx } from '../../tmx/Tmx.js'

export default class TMXDetailsWindow extends PopupWindow {

  private readonly grid: Grid

  constructor() {
    super(componentIds.TMXDetailsWindow, config.icon, config.title, config.navbar, undefined, config.windowHeight)
    tm.commands.add({
      aliases: config.command.aliases,
      help: config.command.help,
      callback: (info): void => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: config.command.privilege
    })
    tmx.onMapChange((): void => {
      this.reRender()
    })
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions, config.rowProportions, config.grid)
  }


  private reRender(): void {
    const logins: string[] = this.getPlayersWithWindowOpen()
    for (const login of logins) {
      this.displayToPlayer(login)
    }
  }

  private constructScreenshot(width: number, height: number, map: tm.TMXMap): string {
    const image: string = map === undefined
      ? config.noScreenshot["Stadium"] // this shouldn't ever be used anyway cause the window isn't constructed if the map is undefined
      : tm.utils.safeString(map.thumbnailUrl + `&.jpeg`)
    return `<quad posn="${config.margin + config.screenshotPadding} ${-config.margin - config.screenshotPadding} 8" sizen="${width - config.screenshotPadding * 2} ${height - config.margin * 2 - config.screenshotPadding * 2}" image="${image}"/>
      ${centeredText(config.notLoaded, width, height, { textScale: config.notLoadedTextscale, yOffset: -1 })}`
  }

  private constructTmxRecordsXml(width: number, height: number, replays: tm.TMXReplay[] = []): string {
    const grid = new Grid(width, height, config.tmxRecordsProportions, new Array(config.tmxRecordsAmount + 1).fill(1),
      { margin: config.margin, background: config.gridBackground, headerBackground: config.iconBackground })
    const options = { textScale: config.recordTextScale }
    const arr: (GridCellFunction | GridCellObject)[] = [
      (i, j, w, h) => centeredText(' Lp. ', w, h, options),
      (i, j, w, h) => centeredText(' Time ', w, h, options),
      (i, j, w, h) => centeredText(' Name ', w, h, options),
      (i, j, w, h) => centeredText(' Date ', w, h, options),
      (i, j, w, h) => centeredText(' Dl. ', w, h, options),
    ]
    const indexCell: GridCellObject = {
      callback: (i, j, w, h) => centeredText(i.toString(), w, h, options),
      background: config.iconBackground
    }
    const timeCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.getTimeString(replays[i - 1]?.time) : config.defaultTime, w, h, options)
    const nameCell: GridCellFunction = (i, j, w, h) =>
      tm.utils.isMultibyte(replays[i - 1]?.name)
        ? leftAlignedText(tm.utils.safeString(config.defaultTime), w, h, options)
        : leftAlignedText(tm.utils.safeString(replays[i - 1]?.name ?? config.defaultTime), w, h, options)
    const dateCell: GridCellFunction = (i, j, w, h) => centeredText(replays[i - 1] !== undefined ?
      tm.utils.formatDate(replays[i - 1]?.recordDate, true) : config.defaultTime, w, h, options)
    const downloadCell: GridCellObject = {
      callback: (i, j, w, h) => replays[i - 1] !== undefined ?
        `<quad posn="${config.margin} ${-config.margin} 5" sizen="${w - config.margin * 2} ${h - config.margin * 2}" 
                image="${config.icons.download}" url="${tm.utils.fixProtocol(replays[i - 1].url)}"
                imagefocus="${config.icons.downloadGreen}"/>` : '',
      background: config.iconBackground
    }
    for (let i = 0; i < config.tmxRecordsAmount; i++) {
      arr.push(indexCell, timeCell, nameCell, dateCell, downloadCell)
    }
    return grid.constructXml(arr)
  }

  // TODO FOR LATER IDK
  // private constructInfo(width: number, height: number, map: tm.TMXMap): string {
  //   const grid = new Grid(width, height, config.info.columnsProportions, new Array(config.info.rows).fill(1),
  //     { margin: config.margin })
  //   const ic = config.icons
  //   let lbIcon = ic.leaderboardRating.normal
  //   let lbRating = (map.leaderboardRating?.toString() ?? map.leaderboardRating?.toString()) ?? config.defaultText
  //   if (map.isNadeo ?? map.leaderboardRating === 50000) {
  //     lbRating = 'Nadeo'
  //     lbIcon = ic.leaderboardRating.nadeo
  //   }
  //   else if (map.isClassic) {
  //     lbRating = 'Classic'
  //     lbIcon = ic.leaderboardRating.classic
  //   }
  //   let awardsIcon = ic.awards.normal
  //   if (lbRating === 'Nadeo') { awardsIcon = ic.awards.nadeo }
  //   else if (lbRating === 'Classic') { awardsIcon = ic.awards.classic }
  //   const infos: [string, string][] = [
  //     [map.mood, ic.mood[map.mood.toLowerCase() as keyof typeof ic.mood]],
  //     [map.environment, ic.environment],
  //     //[map.checkpointsPerLap !== undefined ? `${map.checkpointsPerLap - 1} CPs` : config.defaultText, ic.checkpointsAmount],
  //     [(map.awards?.toString() ?? map.awards?.toString()) ?? config.defaultText, awardsIcon],
  //     [map.author === undefined ? config.defaultText :
  //       (this.isMultiByte(map.author) ? '' : tm.utils.safeString(map.author)), ic.tmxAuthor],
  //     [tm.utils.formatDate(map.lastUpdateDate, true), ic.buildDate],
  //     [map.style ?? config.defaultText, ic.style],
  //     [lbRating, lbIcon],
  //     [map.difficulty ?? config.defaultText, ic.difficulty[(map.difficulty?.toLowerCase() as keyof typeof ic.difficulty) ?? 'beginner']],
  //     [map.routes ?? config.defaultText, ic.routes],
  //     [map.type ?? config.defaultText, ic.type],
  //     [map.game ?? config.defaultText, ic.game]
  //   ]
  //   const cell: GridCellFunction = (i, j, w, h) => {
  //     const index = (i * grid.columns) + j
  //     return `
  //     <quad posn="0 0 4" sizen="${config.info.iconWidth} ${h}" bgcolor="${config.iconBackground}"/>
  //     <quad posn="${config.margin} ${-config.margin} 6" sizen="${config.info.iconWidth - config.margin * 2} ${h - config.margin * 2}" image="${infos?.[index]?.[1] ?? ''}"/>
  //     <frame posn="${config.info.iconWidth + config.margin} 0 2">
  //       <quad posn="0 0 3" sizen="${w - (config.info.iconWidth + config.margin)} ${h}" bgcolor="${config.gridBackground}"/>
  //       ${centeredText(infos?.[index]?.[0] ?? '', w - (config.info.iconWidth + config.margin), h, { textScale: config.info.textscale })}
  //     </frame>`
  //   }
  //   return grid.constructXml(new Array(config.info.columnsProportions.length * config.info.rows).fill(null).map(() => cell))
  // }

  private constructDescription(width: number, height: number, map: tm.TMXMap): string {
    const p = config.description.padding
    const w = width - p * 4
    const h = height - p * 4
    let description = tm.utils.safeString(map.comment.trim().replace(/\[(.*?)\]|\[\/(.*?)\]/gi, ''))
    if (tm.utils.isMultibyte(description)) { description = '' }
    let length = 0
    for (let i = 0; i < description.length; i++) {
      length += description[i] === '\n' ? config.description.lineLength : 1
      if (length > config.description.textLength) {
        description = description.substring(0, i) + '...'
        break
      }
    }
    return `<format textsize="${config.description.textSize}"/>
        <quad posn="${p} ${-p} 3" sizen="${w + p * 2} ${h + p * 2}" bgcolor="${config.description.textBackground}"/>
        <frame posn="${p * 2} ${-p * 2} 1">
          <label posn="0 0 3" sizen="${w} ${h}"
          text="${config.description.format}${length === 0
        ? config.description.defaultText : description
      }" autonewline="1"/>
        </frame>`
  }

  protected async constructContent(): Promise<string> {
    const tmxCurrent = tmx.current
    if (tmxCurrent == null) { return `` }
    const screenshot: GridCellFunction = (i, j, w, h): string => this.constructScreenshot(w, h, tmxCurrent)
    const description: GridCellFunction = (i, j, w, h): string => this.constructDescription(w, h, tmxCurrent)
    const records: GridCellFunction = (i, j, w, h): string => this.constructTmxRecordsXml(w, h, tmxCurrent.validReplays)
    //const info: GridCellFunction = (i, j, w, h): string => this.constructInfo(w, h, tmxCurrent)
    return this.grid.constructXml([screenshot, description, records])

  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}
