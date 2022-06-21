import { calculateStaticPositionY, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class LocalRanking extends StaticComponent {

  private readonly height: number
  private readonly width: number
  private readonly markerWidth: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly grid: Grid

  constructor() {
    super(IDS.LocalRanking, 'race')
    this.height = CONFIG.locals.height
    this.width = CONFIG.static.width
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('locals')
    const proportions = [1, 1, 2.8, 4]
    const insideProportions = proportions.reduce((acc, cur, i) => i === 0 ? acc += 0 : acc += cur)
    const unitWidth = this.width / insideProportions
    this.markerWidth = unitWidth * proportions[0]
    this.grid = new Grid(this.width + this.markerWidth, this.height - CONFIG.staticHeader.height, proportions, new Array(CONFIG.locals.entries).fill(1))
    TM.addListener('Controller.PlayerFinish', () => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      if (TM.localRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo) => {
      if (TM.localRecords.some(a => a.login === info.login)) { this.display() }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader('Local Records', ICONS.barGraph)}
        <frame posn="-${this.markerWidth + CONFIG.static.marginSmall + 0.05} -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1">
          ${this.getContent(login)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private getContent(login: string): string {
    const locals = TM.localRecords
    const playerLocal = TM.localRecords.find(a => a.login === login)
    const playerLocalIndex = playerLocal !== undefined ? TM.localRecords.indexOf(playerLocal) : Infinity
    const side = CONFIG.locals.side
    const markerCell = (i: number, j: number, w: number, h: number): string => {
      if (TM.getPlayer(locals?.[i]?.login) === undefined) { return '' }
      const bg = `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>`
      if (i < playerLocalIndex) { // Player faster than your record
        return bg + `<quad posn="0 0 2" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" image="${ICONS.star.yellow}"/>`
      } if (i > playerLocalIndex) { // Player slower than your record
        return bg + `<quad posn="0 0 2" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" image="${ICONS.star.green}"/>`
      }
      return bg + `<quad posn="0 0 2" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" image="${side ? ICONS.arrowDoubleR.orange : ICONS.arrowDoubleL.orange}"/>`
    }
    const positionCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.staticHeader.bgColor}"/>
      ${centeredText(locals[i] !== undefined ? (`${CONFIG.static.format}${i + 1}`).toString().padStart(2, '0') : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.1 })}`
    }
    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const textColour = this.getTextColour(i, playerLocalIndex)
      return `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>
      <format textsize="1" textcolor="${textColour}"/>
      ${centeredText(locals[i] !== undefined ? `${CONFIG.static.format}${TM.Utils.getTimeString(locals[i].score)}` : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.1 })}`
    }
    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="0 0 1" sizen="${w + CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>
      ${verticallyCenteredText(locals[i] !== undefined ? `${CONFIG.static.format}${TM.safeString(TM.strip(locals[i].nickName, false))}` : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.2 })}`
    }
    const arr: Function[] = []
    for (let i = 0; i < CONFIG.locals.entries; i++) {
      const a = side ? [markerCell, positionCell, timeCell, nicknameCell] : [positionCell, timeCell, nicknameCell, markerCell]
      arr.push(...a)
    }
    return this.grid.constructXml(arr)
  }

  /**
   * Get time color depending on position
   */
  private getTextColour(localIndex: number, playerLocalIndex: number): string {
    if (localIndex < playerLocalIndex) { // Player faster than your record
      if (localIndex >= CFG.locals.topCount) {
        return CFG.widgetStyleRace.colours.better
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else if (localIndex > playerLocalIndex) { // Player slower than your record
      if (localIndex >= CFG.locals.topCount) {
        return CFG.widgetStyleRace.colours.worse
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else { // Your record 
      return CFG.widgetStyleRace.colours.self
    }
  }

}
