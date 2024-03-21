/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, Grid, StaticHeader, StaticComponent, StaticHeaderOptions } from '../../UI.js'
import flags from '../../config/FlagIcons.js'
import { tmx } from '../../../tmx/Tmx.js'
import { webservices, WebservicesInfo } from '../../../webservices/Webservices.js'
import config from './MapWidgetResult.config.js'

export default class MapWidgetResult extends StaticComponent {

  private readonly rows: number = 5
  private readonly header: StaticHeader
  private readonly grid: Grid
  private isRestart: boolean = false
  private xml: string = ''

  constructor() {
    super(componentIds.mapResult)
    this.header = new StaticHeader('result')
    this.grid = new Grid(config.width, config.height + config.margin, [1], new Array(this.rows).fill(1))
    if (webservices.isEnabled) {
      webservices.onNextAuthorChange(() => {
        this.sendMultipleManialinks(this.display())
      })
    }
    this.renderOnEvent('JukeboxChanged', () => {
      return this.display()
    })
    tmx.onMapChange(() => this.sendMultipleManialinks(this.display()))
    tmx.onQueueChange(() => this.sendMultipleManialinks(this.display()))
    tm.addListener('EndMap', (info) => {
      this.isRestart = info.isRestart
    }, true)
  }

  getHeight(): number {
    return config.height
  }

  display() {
    if (!this.isDisplayed) { return }
    this.updateXML()
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  private updateXML(): void {
    const map: Readonly<tm.Map> = this.isRestart ? tm.jukebox.current : tm.jukebox.queue[0]
    const authorData: WebservicesInfo | undefined = this.isRestart ? webservices.currentAuthor : webservices.nextAuthor
    const author: string = authorData?.nickname ?? map.author
    const TMXMap: Readonly<tm.TMXMap> | null = this.isRestart ? tmx.current : tmx.queue[0]
    const date: Date | undefined = TMXMap?.lastUpdateDate
    const ic = config.icons
    let authorIcon: string = ic.author
    if (authorData !== undefined) {
      authorIcon = (flags as any)[authorData.countryCode] // cope typescript
    }
    const obj = this.getTagAndAward(map, TMXMap ?? undefined)
    let timeOrScore: string, timeOrScoreIcon: string
    if (tm.getGameMode() !== 'Stunts') {
      timeOrScore = tm.utils.getTimeString(map.authorTime)
      timeOrScoreIcon = ic.authorTime
    } else {
      if (TMXMap?.authorScore !== undefined) {
        timeOrScore = tm.utils.getTimeString(TMXMap.authorScore) // Cant get author score (goldTime = gold score)
        timeOrScoreIcon = ic.authorScore
      } else {
        timeOrScore = tm.utils.getTimeString(map.goldTime) // Cant get author score (goldTime = gold score)
        timeOrScoreIcon = ic.goldScore
      }
    }
    const infos: [string, string][] = [
      [config.title, ic.header],
      [tm.utils.safeString(map.name), obj.tag],
      [tm.utils.safeString(author), authorIcon],
      [timeOrScore, timeOrScoreIcon],
      [date === undefined ? config.noDateText : tm.utils.formatDate(date), ic.buildDate],
      [TMXMap?.awards === undefined ? config.noAwardsText : TMXMap.awards.toString(), obj.award],
      [TMXMap?.validReplays?.[0]?.time === undefined ? config.noWrText : tm.utils.getTimeString(TMXMap.validReplays[0].time), ic.tmxWr]
    ]
    const headerCfg: StaticHeaderOptions = this.header.options
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 4) {
        return `<frame posn="0 0 1">
        ${this.header.constructXml(infos[i + 1][0], infos[i + 1][1], this.side, {
          rectangleWidth: (headerCfg.rectangleWidth / 2) - (headerCfg.margin + (headerCfg.squareWidth / 2)),
          textScale: config.textScale,
          centerText: true,
          textBackground: config.background
        })}
      </frame>
      <frame posn="${(headerCfg.rectangleWidth / 2) - (headerCfg.margin + (headerCfg.squareWidth / 2)) +
          headerCfg.squareWidth + (headerCfg.margin * 2)} 0 1">
        ${this.header.constructXml(infos[i + 2][0], infos[i + 2][1], this.side, {
            rectangleWidth: (headerCfg.rectangleWidth / 2) - (headerCfg.margin + (headerCfg.squareWidth / 2)),
            textScale: config.textScale,
            centerText: true,
            textBackground: config.background
          })}
      </frame>`
      } else if (i === 3) {
        return `
        <frame posn="0 0 1">
          ${this.header.constructXml(infos[i][0], infos[i][1], this.side, {
          rectangleWidth: (headerCfg.rectangleWidth / 2) - (headerCfg.margin + (headerCfg.squareWidth / 2)),
          textScale: config.textScale,
          centerText: true,
          textBackground: config.background
        })}
        </frame>
        <frame posn="${(headerCfg.rectangleWidth / 2) - (headerCfg.margin + (headerCfg.squareWidth / 2)) +
          headerCfg.squareWidth + (headerCfg.margin * 2)} 0 1">
          ${this.header.constructXml(infos[i + 1][0], infos[i + 1][1], this.side, {
            rectangleWidth: (headerCfg.rectangleWidth / 2) - (headerCfg.margin + (headerCfg.squareWidth / 2)),
            textScale: config.textScale,
            centerText: true,
            textBackground: config.background
          })}
        </frame>`
      }
      return `
      <frame posn="0 0 1">
        ${i === 0 ? this.header.constructXml(infos[i][0], infos[i][1], this.side) :
          this.header.constructXml(tm.utils.strip(infos[i][0], false), infos[i][1], this.side, {
            textScale: config.textScale,
            textBackground: config.background,
            horizontalPadding: config.mapPadding
          })}
      </frame>`
    }
    const arr: any[] = new Array(this.rows).fill(cell)
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 8" sizen="${config.width} ${config.height}" action="${componentIds.TMXWindow}"/>
        <format textsize="1" textcolor="FFFF"/> 
        ${this.grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

  private getTagAndAward(map: tm.Map, TMXMap?: tm.TMXMap): { tag: string, award: string } {
    let tag: string = config.icons.tags.normal
    let award: string = config.icons.awards.normal
    if (map.isNadeo) {
      tag = config.icons.tags.nadeo
      award = config.icons.awards.nadeo
    }
    if (map.isClassic) {
      tag = config.icons.tags.classic
      award = config.icons.awards.classic
    }
    for (const e of config.customTags) {
      if (e?.authors?.some(a => a === map.author || a === TMXMap?.author) ||
        e?.names?.some(a => a.test(map.name) || a.test(tm.utils.strip(map.name)) ||
          (TMXMap !== undefined ? (a.test(TMXMap.name) || a.test(tm.utils.strip(TMXMap.name))) : false))) {
        tag = e.icon
      }
    }
    return { tag, award }
  }
}
