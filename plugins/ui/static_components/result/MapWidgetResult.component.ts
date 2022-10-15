import { IDS, Grid, StaticHeader } from '../../UiUtils.js'
import flags from '../../config/FlagIcons.js'
import StaticComponent from '../../StaticComponent.js'
import { tmx } from '../../../tmx/Tmx.js'
import { webservices } from '../../../webservices/Webservices.js'
import config from './MapWidgetResult.config.js'

export default class MapWidgetResult extends StaticComponent {

  private readonly rows = 5
  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private readonly grid: Grid
  private isRestart = false
  private xml: string = ''

  constructor() {
    super(IDS.map, 'result')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('result')
    this.grid = new Grid(config.width, config.height + config.margin, [1], new Array(this.rows).fill(1))
    if (webservices.isEnabled === true) {
      webservices.onCurrentAuthorChange(() => {
        void this.display()
      })
    }
    tm.addListener('JukeboxChanged', () => {
      void this.display()
    })
    tmx.onMapChange(() => this.display())
    tmx.onQueueChange(() => this.display())
    tm.addListener('EndMap', (info) => {
      this.isRestart = info.isRestart
    }, true)
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    this.updateXML()
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const map = this.isRestart ? tm.jukebox.current : tm.jukebox.queue[0]
    const authorData = this.isRestart ? webservices.currentAuthor : webservices.nextAuthor
    const author: string = authorData?.nickname ?? map.author
    const TMXMap = this.isRestart ? tmx.current : tmx.queue[0]
    const date: Date | undefined = TMXMap?.lastUpdateDate
    const ic = config.icons
    let authorIcon = ic.author
    if (authorData !== undefined) {
      authorIcon = (flags as any)[authorData.countryCode] // cope typescript
    }
    const obj = this.getTagAndAward(map, TMXMap ?? undefined)
    const infos: [string, string][] = [
      [config.title, ic.header],
      [tm.utils.safeString(map.name), obj.tag],
      [tm.utils.safeString(author), authorIcon],
      [tm.utils.getTimeString(map.authorTime), ic.authorTime],
      [date === undefined ? config.noDateText : tm.utils.formatDate(date), ic.buildDate],
      [TMXMap?.awards === undefined ? config.noAwardsText : TMXMap.awards.toString(), obj.award],
      [TMXMap?.validReplays?.[0]?.time === undefined ? config.noWrText : tm.utils.getTimeString(TMXMap.validReplays[0].time), ic.tmxWr]
    ]
    const headerCfg = this.header.options
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
        <quad posn="0 0 8" sizen="${config.width} ${config.height}" action="${IDS.TMXWindow}"/>
        <format textsize="1" textcolor="FFFF"/> 
        ${this.grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

  private getTagAndAward(map: tm.Map, TMXMap?: tm.TMXMap): { tag: string, award: string } {
    let tag = config.icons.tags.normal
    let award = config.icons.awards.normal
    if (map.isNadeo === true) {
      tag = config.icons.tags.nadeo
      award = config.icons.awards.nadeo
    }
    if (map.isClassic === true) {
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