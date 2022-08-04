import { IDS, Grid, CONFIG, staticHeader, ICONS, getStaticPosition, stringToObjectProperty } from '../UiUtils.js'
import flags from '../config/FlagIcons.json' assert { type: 'json' }
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { MapAuthorData } from '../../MapAuthorData.js'

export default class MapWidget extends StaticComponent {

  private width = CONFIG.static.width
  private height: number
  private positionX: number
  private positionY: number
  private xml: string = ''

  constructor() {
    super(IDS.map, 'race')
    // Here height is 4 headers instead of config height
    // To set correct height in config after changing header height copy this.height from debbuger / console.log()
    this.height = (CONFIG.staticHeader.height + CONFIG.marginSmall) * 4 + CONFIG.marginSmall
    const pos = getStaticPosition('map')
    this.positionX = pos.x
    this.positionY = pos.y
    if (process.env.USE_WEBSERVICES === "YES") {
      MapAuthorData.onCurrentAuthorChange(() => {
        void this.display()
      })
    }
  }

  display(): void {
    this.updateXML()
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const rows = 4
    this.height = (CONFIG.staticHeader.height + CONFIG.marginSmall) * rows + CONFIG.marginSmall
    const map = TM.map
    const author: string = MapAuthorData.currentAuthor?.nickname ?? map.author
    const cfg = CONFIG.map
    const tmxmap = TM.TMXCurrent
    const date: Date | undefined = tmxmap?.lastUpdateDate
    const tmxwr = tmxmap?.replays?.[0]?.time
    const grid = new Grid(this.width, this.height - CONFIG.marginSmall, [1], new Array(rows).fill(1))
    const texts: (string | undefined)[] = [
      cfg.title,
      TM.safeString(map.name),
      TM.safeString(author),
      TM.Utils.getTimeString(map.authorTime),
      date === undefined ? undefined : TM.formatDate(date),
      tmxmap?.awards === undefined ? undefined : tmxmap?.awards.toString(),
      tmxwr === undefined ? undefined : TM.Utils.getTimeString(tmxwr)
    ]
    const icons: string[] = cfg.icons.map(a => stringToObjectProperty(a, ICONS))
    if (MapAuthorData.currentAuthor?.nation !== undefined) {
      icons[2] = (flags as any)[MapAuthorData.currentAuthor?.nation] // cope typescript
    }
    const headerCFG = CONFIG.staticHeader
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
        return `
        <frame posn="0 0 1">
          ${staticHeader(texts[i] ?? '', icons[i] ?? '', true, {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: cfg.textScale,
          centerText: true,
          textBackgrund: CONFIG.static.bgColor
        })}
        </frame>
        <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
          headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
          ${staticHeader(texts[i + 1] ?? cfg.noDateText, icons[i + 1] ?? '', true, {
            rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
            textScale: cfg.textScale,
            centerText: true,
            textBackgrund: CONFIG.static.bgColor
          })}
        </frame>`
      }
      return `
      <frame posn="0 0 1">
        ${i === 0 ? staticHeader(texts[i] ?? '', icons[i] ?? '', true) :
          staticHeader(TM.strip(texts[i] ?? '', false), icons[i] ?? '', true, {
            textScale: cfg.textScale,
            textBackgrund: CONFIG.static.bgColor,
            centerVertically: true,
            horizontalPadding: 0.3
          })}
      </frame>`
    }
    const arr: any[] = new Array(4).fill(cell)
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

}