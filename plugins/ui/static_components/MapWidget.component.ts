import { CONFIG as CFG, IDS, Grid, CONFIG, staticHeader, ICONS, getStaticPosition, stringToObjectProperty } from '../UiUtils.js'
import countries from '../../../src/data/Countries.json' assert {type: 'json'}
import flags from '../config/FlagIcons.json' assert {type: 'json'}
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class MapWidget extends StaticComponent {

  private readonly width = CFG.static.width
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private xml: string = ''
  private readonly grid: Grid
  private authorNickname: string | undefined
  private authorNation: string | undefined

  constructor() {
    super(IDS.map, { hideOnResult: true })
    // Here height is 4 headers instead of config height
    // To set correct height in config after changing header height copy this.height from debbuger / console.log()
    this.height = (CFG.staticHeader.height + CFG.marginSmall) * 4 + CFG.marginSmall
    const pos = getStaticPosition('map')
    this.positionX = pos.x
    this.positionY = pos.y
    this.grid = new Grid(this.width, this.height - CONFIG.marginSmall, [1], new Array(4).fill(1))
    if (process.env.USE_WEBSERVICES === "YES") {
      void this.fetchWebservices(TM.map.author)
      TM.addListener('Controller.BeginMap', async (info) => {
        this.authorNickname = undefined
        this.authorNation = undefined
        void this.fetchWebservices(info.author)
        this.display()
      })
    }
  }

  private async fetchWebservices(author: string) {
    const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/
    if (regex.test(author) === true) { return }
    const json: any = await TM.fetchWebServices(author)
    if (json instanceof Error) {
      TM.error(`Failed to fetch nickname for author login ${author}`, json.message)
      this.authorNickname = undefined
    } else {
      if (json?.message === 'Unkown player') { // THANKS NADEO
        TM.error(`Failed to fetch nickname for author login ${author} (no such login registered)`, json.message)
        this.authorNickname = author
      } else {
        this.authorNickname = json?.nickname
        this.authorNation = countries.find(a => a.name === json?.path?.split('|')[1])?.code
      }
    }
    if (this._isDisplayed === true) {
      this.display()
    }
  }

  async display(): Promise<void> {
    this.updateXML()
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const author: string = this.authorNickname ?? TM.map.author
    const date: Date | undefined = TM.TMXCurrent?.lastUpdateDate
    const texts: (string | undefined)[] = [CFG.map.title, TM.safeString(TM.map.name), TM.safeString(author), TM.Utils.getTimeString(TM.map.authorTime), date === undefined ? undefined : TM.formatDate(date)]
    const icons: string[] = CFG.map.icons.map(a => stringToObjectProperty(a, ICONS))
    if (this.authorNation !== undefined) {
      icons[2] = (flags as any)[this.authorNation] // cope typescript
    }
    const headerCFG = CONFIG.staticHeader
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
        return `
        <frame posn="0 0 1">
          ${staticHeader(texts[i] ?? '', icons[i] ?? '', true, {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: CONFIG.map.textScale,
          centerText: true,
          textBackgrund: CONFIG.static.bgColor
        })}
        </frame>
        <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
          headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
          ${staticHeader(texts[i + 1] ?? CONFIG.map.noDateText, icons[i + 1] ?? '', true, {
            rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
            textScale: CONFIG.map.textScale,
            centerText: true,
            textBackgrund: CONFIG.static.bgColor
          })}
        </frame>`
      }
      return `
      <frame posn="0 0 1">
        ${i === 0 ? staticHeader(texts[i] ?? '', icons[i] ?? '', true) :
          staticHeader(TM.strip(texts[i] ?? '', false), icons[i] ?? '', true, {
            textScale: CONFIG.map.textScale,
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
        ${this.grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

}