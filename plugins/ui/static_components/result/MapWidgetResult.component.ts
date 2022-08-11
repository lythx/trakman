import { RESULTCONFIG as RCFG, IDS, Grid, resultStaticHeader, ICONS, stringToObjectProperty, GridCellFunction, getResultPosition } from '../../UiUtils.js'
import flags from '../../config/FlagIcons.json' assert {type: 'json'}
import { trakman as tm } from '../../../../src/Trakman.js'
import StaticComponent from '../../StaticComponent.js'
import { MapAuthorData } from '../../../MapAuthorData.js'

export default class MapWidgetResult extends StaticComponent {

  private width = RCFG.static.width
  private height: number
  private positionX: number
  private positionY: number
  private xml: string = ''
  private isRestart = false

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
    tm.addListener('Controller.JukeboxChanged', () => {
      void this.display()
    })
    tm.addListener('Controller.TMXQueueChanged', () => {
      this.display()
    })
    tm.addListener('Controller.EndMap', (info) => {
      this.isRestart = info.isRestart
    }, true)
  }

  async display(): Promise<void> {
    if (!this.isDisplayed) { return }
    this.updateXML()
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const rows = 5
    this.height = (RCFG.staticHeader.height + RCFG.marginSmall) * rows + RCFG.marginSmall
    const map = this.isRestart ? tm.jukebox.current : tm.jukebox.queue[0]
    const authorData = this.isRestart ? MapAuthorData.currentAuthor : MapAuthorData.nextAuthor
    const author: string = authorData?.nickname ?? map.author
    const cfg = RCFG.map
    const tmxmap = this.isRestart ? tm.tmx.current : tm.tmx.next[0]
    const date: Date | undefined = tmxmap?.lastUpdateDate
    const tmxwr = tmxmap?.replays?.[0]?.time
    const grid = new Grid(this.width, this.height - RCFG.marginSmall, [1], new Array(rows).fill(1))
    const texts: (string | undefined)[] = [
      cfg.title,
      tm.utils.safeString(map.name),
      tm.utils.safeString(author),
      tm.utils.getTimeString(map.authorTime),
      date === undefined ? undefined : tm.utils.formatDate(date),
      tmxmap?.awards === undefined ? undefined : tmxmap?.awards.toString(),
      tmxwr === undefined ? undefined : tm.utils.getTimeString(tmxwr)
    ]
    const icons: string[] = cfg.icons.map(a => stringToObjectProperty(a, ICONS))
    if (authorData?.country !== undefined) {
      icons[2] = flags[authorData?.country as keyof typeof flags] // cope typescript
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
          resultStaticHeader(tm.utils.strip(texts[i] ?? '', false), icons[i] ?? '', true, {
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