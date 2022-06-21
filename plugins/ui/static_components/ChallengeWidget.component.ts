import { CONFIG as CFG, IDS, Grid, CONFIG, staticHeader, ICONS, centeredText, calculateStaticPositionY } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class ChallengeWidget extends StaticComponent {

  private xml: string = ''
  private readonly grid: Grid
  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number

  constructor() {
    super(IDS.ChallengeWidget, 'race')
    this.width = CFG.static.width
    this.height = CFG.map.height
    this.grid = new Grid(this.width, this.height, [1], new Array(4).fill(1))
    this.positionX = CFG.static.rightPosition
    this.positionY = calculateStaticPositionY('map')
  }

  display(): void {
    this._isDisplayed = true
    this.updateXML().then(() => {
      TM.sendManialink(this.xml)
    })
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
    const icons = CFG.map.icons.map(a => (ICONS as any)[a])
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
        return `
        <frame posn="0 -${CONFIG.static.marginSmall} 1">
          ${staticHeader(texts[i] ?? '', icons[i], {
          rectangleWidth: (CONFIG.staticHeader.rectangleWidth / 2) - (CONFIG.staticHeader.margin + (CONFIG.staticHeader.squareWidth / 2)),
          textScale: CONFIG.map.textScale,
          centerText: true,
          textBackgrund: CONFIG.static.bgColor
        })}
        </frame>
        <frame posn="${(CONFIG.staticHeader.rectangleWidth / 2) - (CONFIG.staticHeader.margin + (CONFIG.staticHeader.squareWidth / 2)) +
          CONFIG.staticHeader.squareWidth + (CONFIG.staticHeader.margin * 2)} -${CONFIG.static.marginSmall} 1">
          ${staticHeader(texts[i + 1] ?? '', icons[i + 1], {
            rectangleWidth: (CONFIG.staticHeader.rectangleWidth / 2) - (CONFIG.staticHeader.margin + (CONFIG.staticHeader.squareWidth / 2)),
            textScale: CONFIG.map.textScale,
            centerText: true,
            textBackgrund: CONFIG.static.bgColor
          })}
        </frame>`
      }
      return `
      <frame posn="0 -${CONFIG.static.marginSmall} 1">
        ${i === 0 ? staticHeader(texts[i] ?? '', icons[i]) :
          staticHeader(texts[i] ?? '', icons[i], {
            textScale: CONFIG.map.textScale,
            textBackgrund: CONFIG.static.bgColor
          })}
      </frame>`
    }
    const arr: Function[] = new Array(4).fill(cell)
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

}
// `<frame posn="49.2 48 1">
// <quad posn="0 0 2" sizen="15.5 9.2" action="2000"/>
// <format textsize="1" textcolor="FFFF"/>
// <frame posn="0 -0.1 1">
//   <quad posn="0 0 1" sizen="1.7 2.2" bgcolor="0006"/>
//   <quad posn="1.85 0 1" sizen="12.8 2.2" bgcolor="0006"/>
//   <label posn="2.2 -0.2 2" sizen="11.8 2" scale="1.2" text="$sONGOING"/>
// </frame>
//   <frame posn="0 -2.45 1">
//   <quad posn="0 0 1" sizen="1.7 2.2" bgcolor="0006"/>
//   <quad posn="1.85 0 1" sizen="12.8 2.2" bgcolor="0006"/>
//   <label posn="2.2 -0.2 2" sizen="11.8 2" scale="1" text="$sfsfdsfsd"/>
// </frame>
// <frame posn="0 -4.85 1">
//   <quad posn="0 0 1" sizen="1.7 2.2" bgcolor="0006"/>
//   <quad posn="1.85 0 1" sizen="12.8 2.2" bgcolor="0006"/>
//   <label posn="2.2 -0.2 2" sizen="11.8 2" scale="1" text="$sdfdfsfsd"/>
// </frame>
// <frame posn="0 -7.25 1">
//   <quad posn="0 0 1" sizen="1.7 2.2" bgcolor="0006"/>
//   <quad posn="1.85 0 1" sizen="5.4 2.2" bgcolor="0006"/>
//   <label posn="2.2 -0.2 2" sizen="11.8 2" scale="1.1" text="$s0:00.00"/>
//   <quad posn="7.4 0 1" sizen="1.7 2.2" bgcolor="0006"/>
//   <quad posn="9.25 0 1" sizen="5.4 2.2" bgcolor="0006"/>
//   <label posn="9.6 -0.2 2" sizen="11.8 2" scale="1.1" text="$s2020/08"/>
// </frame>
// </frame>`