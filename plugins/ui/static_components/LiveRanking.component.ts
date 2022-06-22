import { calculateStaticPositionY, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class LiveRanking extends StaticComponent {

  private readonly height: number
  private readonly width: number
  private readonly markerWidth: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly grid: Grid

  constructor() {
    super(IDS.LiveRanking, 'race')
    this.height = CONFIG.live.height
    this.width = CONFIG.static.width
    this.positionX = CONFIG.static.rightPosition
    this.positionY = calculateStaticPositionY('live')
    const proportions = CONFIG.live.columnProportions
    const insideProportions = proportions.reduce((acc, cur, i) => i === 0 ? acc += 0 : acc += cur)
    const unitWidth = this.width / insideProportions
    this.markerWidth = unitWidth * proportions[0]
    this.grid = new Grid(this.width + this.markerWidth, this.height, proportions, new Array(CONFIG.live.entries).fill(1))
    TM.addListener('Controller.LiveRecord', () => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      if (TM.liveRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo) => {
      if (TM.liveRecords.some(a => a.login === info.login)) { this.display() }
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    const offset = 0.05 // idk why but without this its offset, i see no reason for this whatsoever
    TM.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader('Live Records', ICONS.sun)}
        <frame posn="-${this.markerWidth + CONFIG.static.marginSmall + offset} -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1">
          ${this.getContent(login)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private getContent(login: string): string {
    const liveRecs = TM.liveRecords
    const playerLive = TM.liveRecords.find(a => a.login === login)
    const playerLiveIndex = playerLive !== undefined ? TM.liveRecords.indexOf(playerLive) : Infinity
    let personalStart = playerLiveIndex > TM.liveRecords.length - Math.ceil((CFG.live.entries - CFG.live.topCount) / 2) ?
      TM.liveRecords.length - (CFG.live.entries - CFG.live.topCount) :
      playerLiveIndex - Math.floor((CFG.live.entries - CFG.live.topCount) / 2)
    if (playerLiveIndex === Infinity) { personalStart++ }
    const side = CONFIG.live.side
    const markerCell = (i: number, j: number, w: number, h: number): string => {
      if (TM.getPlayer(liveRecs?.[i]?.login) === undefined) { return '' }
      const bg = `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>`
      if (i < playerLiveIndex) { // Player faster than your record
        return bg + `<quad posn="0 0 2" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" image="${ICONS.star.yellow}"/>`
      } if (i > playerLiveIndex) { // Player slower than your record
        return bg + `<quad posn="0 0 2" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" image="${ICONS.star.green}"/>`
      }
      return bg + `<quad posn="0 0 2" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" image="${side ? ICONS.arrowDoubleR.orange : ICONS.arrowDoubleL.orange}"/>`
    }
    const positionCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.staticHeader.bgColor}"/>
      ${centeredText(liveRecs[i] !== undefined ? (`${CONFIG.static.format}${i + 1}`).toString().padStart(2, '0') : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.1 })}`
    }
    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const textColour = this.getTextColour(i, playerLiveIndex)
      return `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>
      <format textsize="1" textcolor="${textColour}"/>
      ${centeredText(liveRecs[i] !== undefined ? `${CONFIG.static.format}${TM.Utils.getTimeString(liveRecs[i].score)}` : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.1 })}`
    }
    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="0 0 1" sizen="${w + CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>
      ${verticallyCenteredText(liveRecs[i] !== undefined ? `${CONFIG.static.format}${TM.safeString(TM.strip(liveRecs[i].nickName, false))}` : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.2 })}`
    }
    const arr: Function[] = []
    for (let i = 0; i < CONFIG.live.entries; i++) {
      const a = side ? [markerCell, positionCell, timeCell, nicknameCell] : [positionCell, timeCell, nicknameCell, markerCell]
      arr.push(...a)
    }
    return this.grid.constructXml(arr)
  }

  /**
   * Get time color depending on position
   */
  private getTextColour(liveIndex: number, playerLiveIndex: number): string {
    if (liveIndex < playerLiveIndex) { // Player faster than your record
      if (liveIndex >= CFG.live.topCount) {
        return CFG.widgetStyleRace.colours.better
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else if (liveIndex > playerLiveIndex) { // Player slower than your record
      if (liveIndex >= CFG.live.topCount) {
        return CFG.widgetStyleRace.colours.worse
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else { // Your record 
      return CFG.widgetStyleRace.colours.self
    }
  }

}
