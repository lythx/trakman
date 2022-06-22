import { CONFIG as CFG, IDS, Grid, CONFIG, staticHeader, ICONS, centeredText, calculateStaticPositionY, stringToObjectProperty } from '../UiUtils.js'
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
    super(IDS.MapWidget, 'race')
    this.width = CFG.static.width
    // Here height is 4 headers instead of config height
    // To set correct height in config after changing header height copy this.height from debbuger / console.log()
    this.height = (CFG.staticHeader.height + CFG.static.marginSmall) * 4
    this.positionX = CFG.static.rightPosition
    this.positionY = calculateStaticPositionY('map')
    this.grid = new Grid(this.width, this.height, [1], new Array(4).fill(1))
    void this.updateXML()
    TM.addListener('Controller.EndChallenge', (info: EndChallengeInfo) => {
      void this.updateXML()
    })
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private async updateXML(): Promise<void> {
    let author
    const authorLogin = TM.challenge.author
    if (process.env.USE_WEBSERVICES === "YES" && authorLogin.match(/[\da - z_ +.-]/)) {
      const json = await TM.fetchWebServices(authorLogin)
      if (json instanceof Error) {
        TM.error(`Failed to fetch nickname for author login ${authorLogin}`, json.message)
        author = authorLogin
      }
      else {
        author = json.nickname
      }
    }
    else {
      author = authorLogin
    }
    const date = TM.TMXCurrent?.lastUpdateDate
    const texts = [CFG.map.title, TM.safeString(TM.challenge.name), TM.safeString(author), TM.Utils.getTimeString(TM.challenge.authorTime), date === undefined ? undefined : TM.formatDate(date)]
    const icons = CFG.map.icons.map(a => stringToObjectProperty(a, ICONS))
    const headerCFG = CONFIG.staticHeader
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
        return `
        <frame posn="0 0 1">
          ${staticHeader(texts[i] ?? '', icons[i] ?? '', {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: CONFIG.map.textScale,
          centerText: true,
          textBackgrund: CONFIG.static.bgColor
        })}
        </frame>
        <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
          headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
          ${staticHeader(texts[i + 1] ?? CONFIG.map.noDateText, icons[i + 1] ?? '', {
            rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
            textScale: CONFIG.map.textScale,
            centerText: true,
            textBackgrund: CONFIG.static.bgColor
          })}
        </frame>`
      }
      return `
      <frame posn="0 0 1">
        ${i === 0 ? staticHeader(texts[i] ?? '', icons[i] ?? '') :
          staticHeader(TM.strip(texts[i] ?? '', false), icons[i] ?? '', {
            textScale: CONFIG.map.textScale,
            textBackgrund: CONFIG.static.bgColor,
            centerVertically: true,
            horizontalPadding: 0.3
          })}
      </frame>`
    }
    const arr= new Array(4).fill(cell)
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

}