import { CONFIG as CFG, IDS, Grid, CONFIG, staticHeader, ICONS, centeredText, calculateStaticPositionY, stringToObjectProperty } from '../UiUtils.js'
import countries from '../../../src/data/Countries.json' assert {type: 'json'}
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class MapWidget extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private xml: string = ''
  private readonly grid: Grid

  constructor() {
    super(IDS.map, 'race')
    this.width = CFG.static.width
    // Here height is 4 headers instead of config height
    // To set correct height in config after changing header height copy this.height from debbuger / console.log()
    this.height = (CFG.staticHeader.height + CFG.static.marginSmall) * 4 + CFG.static.marginSmall
    this.positionX = CFG.static.rightPosition
    this.positionY = calculateStaticPositionY('map')
    this.grid = new Grid(this.width, this.height, [1], new Array(4).fill(1))
    void this.updateXML()
  }

  async display(): Promise<void> {
    await this.updateXML()
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private async updateXML(): Promise<void> {
    let author: string, nation: string | undefined
    const authorLogin: string = TM.map.author
    const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/
    if (process.env.USE_WEBSERVICES === "YES" && !regex.test(authorLogin)) {
      const json: any = await TM.fetchWebServices(authorLogin)
      if (json instanceof Error) {
        TM.error(`Failed to fetch nickname for author login ${authorLogin}`, json.message)
        author = authorLogin
      }
      else {
        author = json.nickname
        nation = countries.find(a => a.name === json.path.split('|')[1])?.code
      }
    }
    else {
      author = authorLogin
    }
    const date: any = TM.TMXCurrent?.lastUpdateDate
    const texts: (string | undefined)[] = [CFG.map.title, TM.safeString(TM.map.name), TM.safeString(author), TM.Utils.getTimeString(TM.map.authorTime), date === undefined ? undefined : TM.formatDate(date)]
    const icons: string[] = CFG.map.icons.map(a => stringToObjectProperty(a, ICONS))
    if (nation !== undefined) {
      icons[2] = `tmtp://Skins/Avatars/Flags/${nation}.dds`
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