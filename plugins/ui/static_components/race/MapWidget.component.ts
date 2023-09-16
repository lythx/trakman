/**
 * @author lythx
 * @since 0.1
 */

import { componentIds, Grid, StaticHeader, StaticComponent, StaticHeaderOptions } from '../../UI.js'
import flags from '../../config/FlagIcons.js'
import { tmx } from '../../../tmx/Tmx.js'
import { webservices } from '../../../webservices/Webservices.js'
import config from './MapWidget.config.js'

export default class MapWidget extends StaticComponent {

  private readonly rows: number = 4
  private readonly header: StaticHeader
  private readonly grid: Grid
  private xml: string = ''

  constructor() {
    super(componentIds.map)
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width, config.height + config.margin, [1], new Array(this.rows).fill(1))
    webservices.onCurrentAuthorChange((): void => {
      this.sendMultipleManialinks(this.display())
    })
    tmx.onMapChange(() => this.sendMultipleManialinks(this.display()))
    tmx.onQueueChange(() => this.sendMultipleManialinks(this.display()))
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
    const map: Readonly<tm.CurrentMap> = tm.maps.current
    const author: string = webservices.currentAuthor?.nickname ?? map.author
    const TMXMap: Readonly<tm.TMXMap> | null = tmx.current
    const date: Date | undefined = TMXMap?.lastUpdateDate
    const ic = config.icons
    let authorIcon: string = ic.author
    if (webservices.currentAuthor !== undefined) {
      authorIcon = (flags as any)[webservices.currentAuthor.countryCode] // cope typescript
    }
    const infos: [string, string][] = [
      [config.title, ic.header],
      [tm.utils.safeString(map.name), this.getTag(map, TMXMap ?? undefined)],
      [tm.utils.safeString(author), authorIcon],
      [tm.utils.getTimeString(map.authorTime), ic.authorTime],
      [date === undefined ? config.noDateText : tm.utils.formatDate(date), ic.buildDate]
    ]
    const headerCfg: StaticHeaderOptions = this.header.options
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
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

  private getTag(map: tm.Map, TMXMap?: tm.TMXMap): string {
    for (const e of config.customTags) {
      if (e?.authors?.some(a => a === map.author || a === TMXMap?.author) ||
        e?.names?.some(a => a.test(map.name) || a.test(tm.utils.strip(map.name)) ||
          (TMXMap !== undefined ? (a.test(TMXMap.name) || a.test(tm.utils.strip(TMXMap.name))) : false))) {
        return e.icon
      }
    }
    if (map.isNadeo) {
      return config.icons.tags.nadeo
    }
    if (map.isClassic) {
      return config.icons.tags.classic
    }
    return config.icons.tags.normal
  }

}
