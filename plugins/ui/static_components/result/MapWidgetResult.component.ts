import { RESULTCONFIG as RCFG, IDS, Grid, resultStaticHeader, ICONS, stringToObjectProperty, GridCellFunction, getResultPosition } from '../../UiUtils.js'
import flags from '../../config/FlagIcons.json' assert {type: 'json'}
import { TRAKMAN as TM } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import { MapAuthorData } from '../../../MapAuthorData.js'

export default class MapWidgetResult extends StaticComponent {

  private width = RCFG.static.width
  private height: number
  private positionX: number
  private positionY: number
  private xml: string = ''

  constructor() {
    super(IDS.mapResult, 'result')
    // Here height is  5  headers instead of config height
    // To set correct height in config after changing header height copy this.height from debbuger / console.log()
    this.height = (RCFG.staticHeader.height + RCFG.marginSmall) * 5 + RCFG.marginSmall
    const pos = getResultPosition('map')
    this.positionX = pos.x
    this.positionY = pos.y
    if (process.env.USE_WEBSERVICES === "YES") {
      MapAuthorData.onNextAuthorChange(() => this.display())
    }
    TM.addListener('Controller.JukeboxChanged', () => {
      void this.display()
    })
    TM.addListener('Controller.TMXQueueChanged', () => {
      this.display()
    })
  }

  async display(): Promise<void> {
    this.updateXML()
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const rows = 5
    this.height = (RCFG.staticHeader.height + RCFG.marginSmall) * rows + RCFG.marginSmall
    const map = TM.mapQueue[0]
    const author: string = MapAuthorData?.nextAuthorData?.nickname ?? map.author
    const cfg = RCFG.map
    const tmxmap = TM.TMXNext[0]
    const date: Date | undefined = tmxmap?.lastUpdateDate
    const tmxwr = tmxmap?.replays?.[0]?.time
    const grid = new Grid(this.width, this.height - RCFG.marginSmall, [1], new Array(rows).fill(1))
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
    if (MapAuthorData?.nextAuthorData?.nation !== undefined) {
      icons[2] = (flags as any)[MapAuthorData?.nextAuthorData?.nation] // cope typescript
    }
    const headerCFG = RCFG.staticHeader
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
        return `
        <frame posn="0 0 1">
          ${resultStaticHeader(texts[i] ?? '', icons[i] ?? '', true, {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: cfg.textScale,
          centerText: true,
          textBackgrund: RCFG.static.bgColor
        })}
        </frame>
        <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
          headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
          ${resultStaticHeader(texts[i + 1] ?? cfg.noDateText, icons[i + 1] ?? '', true, {
            rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
            textScale: cfg.textScale,
            centerText: true,
            textBackgrund: RCFG.static.bgColor
          })}
        </frame>`
      }
      return `
      <frame posn="0 0 1">
        ${i === 0 ? resultStaticHeader(texts[i] ?? '', icons[i] ?? '', true) :
          resultStaticHeader(TM.strip(texts[i] ?? '', false), icons[i] ?? '', true, {
            textScale: cfg.textScale,
            textBackgrund: RCFG.static.bgColor,
            centerVertically: true,
            horizontalPadding: 0.3
          })}
      </frame>`
    }
    const resultCell: GridCellFunction = (i, j, w, h) => {
      return `<frame posn="0 0 1">
      ${resultStaticHeader(texts[i + 1] ?? cfg.noDateText, icons[i + 1] ?? '', true, {
        rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
        textScale: cfg.textScale,
        centerText: true,
        textBackgrund: RCFG.static.bgColor
      })}
    </frame>
    <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
        headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
      ${resultStaticHeader(texts[i + 2] ?? cfg.noDateText, icons[i + 2] ?? '', true, {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: cfg.textScale,
          centerText: true,
          textBackgrund: RCFG.static.bgColor
        })}
    </frame>`
    }
    const arr: any[] = new Array(4).fill(cell)
    arr.push(resultCell)
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

}