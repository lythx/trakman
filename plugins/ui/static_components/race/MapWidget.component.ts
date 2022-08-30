import { IDS, Grid, StaticHeader } from '../../UiUtils.js'
import flags from '../../config/FlagIcons.json' assert { type: 'json' }
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import { tmx } from '../../../tmx/Tmx.js'
import { MapAuthorData } from '../../../MapAuthorData.js'
import config from './MapWidget.config.js'

export default class MapWidget extends StaticComponent {

  private readonly rows = 4
  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private readonly grid: Grid
  private xml: string = ''

  constructor() {
    super(IDS.map, 'race')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.grid = new Grid(config.width, config.height + config.margin, [1], new Array(this.rows).fill(1))
    if (process.env.USE_WEBSERVICES === "YES") { // TODO FIX
      MapAuthorData.onCurrentAuthorChange(() => {
        void this.display()
      })
    }
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
    const map = tm.maps.current
    const author: string = MapAuthorData.currentAuthor?.nickname ?? map.author
    const tmxMap = tmx.current
    const date: Date | undefined = tmxMap?.lastUpdateDate
    const ic = config.icons
    let authorIcon = ic.author
    if (MapAuthorData.currentAuthor?.country !== undefined) {
      authorIcon = (flags as any)[MapAuthorData.currentAuthor.country] // cope typescript
    }
    const infos: [string, string][] = [
      [config.title, ic.header],
      [tm.utils.safeString(map.name), this.getTag(map, tmxMap ?? undefined)],
      [tm.utils.safeString(author), authorIcon],
      [tm.utils.getTimeString(map.authorTime), ic.authorTime],
      [date === undefined ? config.noDateText : tm.utils.formatDate(date), ic.buildDate]
    ]
    const headerCfg = this.header.options
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
        <format textsize="1" textcolor="FFFF"/> 
        ${this.grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

  private getTag(map: TMMap, tmxMap?: TMXMapInfo): string {
    for (const e of config.customTags) {
      if (e?.authors?.some(a => a === map.author || a === tmxMap?.author) ||
        e?.names?.some(a => a.test(map.name) || a.test(tm.utils.strip(map.name)) ||
          (tmxMap !== undefined ? (a.test(tmxMap.name) || a.test(tm.utils.strip(tmxMap.name))) : false))) {
        return e.icon
      }
    }
    if (map.leaderboardRating === 50000 || tmxMap?.isNadeo === true) { // TODO implement isNadeo on map
      return config.icons.tags.nadeo
    }
    if (map.leaderboardRating === 0 || tmxMap?.isClassic === true) {
      return config.icons.tags.classic
    }
    return config.icons.tags.normal
  }

}