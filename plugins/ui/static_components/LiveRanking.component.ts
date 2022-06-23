import { calculateStaticPositionY, centeredText, CONFIG as CFG, CONFIG, ICONS, IDS, staticHeader, Grid, verticallyCenteredText, fullScreenListener, stringToObjectProperty, getBestWorstEqualCps } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import 'dotenv/config'

export default class LiveRanking extends StaticComponent {

  private readonly height: number
  private readonly width: number
  private readonly markerWidth: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly grid: Grid
  private readonly offset = 0.03
  private readonly detailedInfos: { login: string, indexes: number[] }[] = []
  private readonly maxRecords = 250
  private detailedInfoRows: number
  private detailedInfoColumns: number

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
    this.grid = new Grid(this.width + this.markerWidth, this.height - CONFIG.staticHeader.height, proportions, new Array(CONFIG.live.entries).fill(1))
    const cpAmount = TM.challenge.checkpointsAmount
    this.detailedInfoRows = Math.ceil(cpAmount / 3) + 1
    if (cpAmount / (this.detailedInfoRows - 1) > CONFIG.recordInfo.minColumns) {
      this.detailedInfoColumns = Math.ceil(cpAmount / (this.detailedInfoRows - 1))
    } else {
      this.detailedInfoColumns = CONFIG.recordInfo.minColumns
    }
    TM.addListener('Controller.LiveRecord', () => {
      this.display()
    })
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      if (TM.liveRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.PlayerLeave', (info: LeaveInfo) => {
      if (TM.liveRecords.some(a => a.login === info.login)) { this.display() }
    })
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
      if (info.answer === this.id + 1) {
        const detailedInfoIndex = this.detailedInfos.findIndex(a => a.login === info.login)
        if (detailedInfoIndex !== -1) {
          this.detailedInfos.splice(detailedInfoIndex, 1)
        }
        this.displayToPlayer(info.login)
      }
      if (info.answer > this.id + 1 && info.answer <= this.id + this.maxRecords + 1) {
        const index = info.answer - this.id - 1
        const detailedInfo = this.detailedInfos.find(a => a.login === info.login)
        if (detailedInfo === undefined) {
          this.detailedInfos.push({ login: info.login, indexes: [index] })
        } else if (!detailedInfo.indexes.includes(index)) {
          detailedInfo.indexes.push(index)
        } else {
          const index = detailedInfo.indexes.indexOf(info.answer - this.id - 1)
          if (index !== -1) {
            detailedInfo.indexes.splice(index, 1)
          }
        }
        this.displayToPlayer(info.login)
      }
    })
    TM.addListener('Controller.BeginChallenge', (info: BeginChallengeInfo) => {
      this.detailedInfos.length = 0
      const cpAmount = TM.challenge.checkpointsAmount
      this.detailedInfoRows = Math.ceil(cpAmount / 3) + 1
      if (cpAmount / (this.detailedInfoRows - 1) > CONFIG.recordInfo.minColumns) {
        this.detailedInfoColumns = Math.ceil(cpAmount / (this.detailedInfoRows - 1))
      } else {
        this.detailedInfoColumns = CONFIG.recordInfo.minColumns
      }
    })
  }

  display(): void {
    this._isDisplayed = true
    // Here all manialinks have to be constructed separately because they are different for every player
    for (const player of TM.players) {
      this.displayToPlayer(player.login)
    }
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.live.title, stringToObjectProperty(CONFIG.live.icon, ICONS))}
        <frame posn="-${this.markerWidth + CONFIG.static.marginSmall + this.offset} -${CONFIG.staticHeader.height + CONFIG.static.marginSmall} 1">
          ${this.getContent(login)}
        </frame>
      </frame>
    </manialink>`,
      login
    )
  }

  private getContent(login: string): string {
    const records = TM.liveRecords
    const playerRecord = records.find(a => a.login === login)
    const playerRecordIndex = playerRecord !== undefined ? records.indexOf(playerRecord) : Infinity
    const markers = this.calculateMarkers(records, playerRecordIndex, login)
    const side = CONFIG.live.side
    const markerCell = (i: number, j: number, w: number, h: number): string => {
      const height = h - (2 * CONFIG.static.marginSmall)
      const width = CONFIG.staticHeader.iconWidth
      const posY = CONFIG.static.marginSmall / 2
      const posX = CONFIG.staticHeader.iconVerticalPadding
      if (markers[i] === undefined) { return '' }
      const markerBg = `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>`
      const infoPosition = markers[i]?.infoPosition
      let window = ''
      if (infoPosition !== undefined) {
        const width = CONFIG.recordInfo.columnWidth * this.detailedInfoColumns
        window += `<frame posn="${(-width - ((width + CONFIG.static.marginSmall) * (infoPosition))) + w} 0 2">${this.contructRecordInfo(width, h, i, records[i], markers[i].cpTypes)}</frame> 
        ${fullScreenListener(this.id + 1)}`
      } if (markers[i].marker === 'faster') {
        return window + markerBg + `<quad posn="${posX} -${posY} 2" sizen="${width} ${height}" image="${stringToObjectProperty(CONFIG.live.markers.faster, ICONS)}"/>`
      } if (markers[i].marker === 'slower') {
        return window + markerBg + `<quad posn="${posX} -${posY} 2" sizen="${width} ${height}" image="${stringToObjectProperty(CONFIG.live.markers.slower, ICONS)}"/>`
      } if (markers[i].marker === 'you') {
        return window + markerBg + `<quad posn="${posX} -${posY} 2" sizen="${width} ${height}" image="${stringToObjectProperty(CONFIG.live.markers.you, ICONS)}"/>`
      }
      return window
    }
    const positionCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="0 0 4" sizen="${this.width} ${h - CONFIG.static.marginSmall}" action="${this.id + i + 2}"/>
      <quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.staticHeader.bgColor}"/>
      ${centeredText(records[i] !== undefined ? (`${CONFIG.static.format}${i + 1}`).toString().padStart(2, '0') : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.1 })}`
    }
    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const textColour = this.getTextColour(i, playerRecordIndex)
      return `<quad posn="0 0 1" sizen="${w - CONFIG.static.marginSmall} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>
      <format textsize="1" textcolor="${textColour}"/>
      ${centeredText(records[i] !== undefined ? `${CONFIG.static.format}${TM.Utils.getTimeString(records[i].score)}` : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.1 })}`
    }
    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      return `<quad posn="0 0 1" sizen="${w + CONFIG.static.marginSmall + this.offset} ${h - CONFIG.static.marginSmall}" bgcolor="${CONFIG.static.bgColor}"/>
      ${verticallyCenteredText(records[i] !== undefined ? `${CONFIG.static.format}${TM.safeString(TM.strip(records[i].nickName, false))}` : '', w - CONFIG.static.marginSmall, h - CONFIG.static.marginSmall, { textScale: 0.85, padding: 0.2 })}`
    }
    const arr = []
    for (let i = 0; i < CONFIG.live.entries; i++) {
      const a = side ? [markerCell, positionCell, timeCell, nicknameCell] : [positionCell, timeCell, nicknameCell, markerCell]
      arr.push(...a)
    }
    return this.grid.constructXml(arr)
  }

  /**
   * Get time color depending on position
   */
  private getTextColour(recordIndex: number, playerRecordIndex: number): string {
    if (recordIndex < playerRecordIndex) { // Player faster than your record
      if (recordIndex >= CFG.live.topCount) {
        return CFG.widgetStyleRace.colours.better
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else if (recordIndex > playerRecordIndex) { // Player slower than your record
      if (recordIndex >= CFG.live.topCount) {
        return CFG.widgetStyleRace.colours.worse
      } else { // Player is in top records
        return CFG.widgetStyleRace.colours.top
      }
    } else { // Your record 
      return CFG.widgetStyleRace.colours.self
    }
  }

  private calculateMarkers(records: FinishInfo[], playerRecordIndex: number, login: string): { marker: 'faster' | 'slower' | 'you' | null, infoPosition: number | undefined, cpTypes: ('best' | 'worst' | 'equal' | undefined)[] }[] {
    const arr: (boolean | 'half')[][] = []
    for (let i = 0; i < records.length; i++) {
      arr.push(new Array(this.detailedInfoRows).fill(false))
    }
    const detailedInfos: { index: number, position: number }[] = []
    const infos = this.detailedInfos.find(a => a.login === login)?.indexes
    const cpAmount = TM.challenge.checkpointsAmount
    const cps: number[][] = Array.from(Array(cpAmount - 1), () => [])
    if (infos !== undefined) {
      for (const [i, e] of records.entries()) {
        if (infos.includes(i + 1)) {
          const position = arr[i].findIndex(a => a === false)
          detailedInfos.push({ index: i, position: arr[i].indexOf(false) })
          for (const [j, cp] of e.checkpoints.entries()) {
            cps[j][i] = cp
          }
          const n = cpAmount % this.detailedInfoColumns === 0 ? 0 : 1
          for (let j = 0; j < this.detailedInfoRows; j++) {
            if (arr[i + j] === undefined) { break }
            arr[i + j][position] = (this.detailedInfoRows - n) === j ? 'half' : true
          }
        }
      }
    }
    const cpTypes = cps?.[0]?.filter(a => !isNaN(a)).length === 1 ? getBestWorstEqualCps(cps.map((a, i) => [...a, records[playerRecordIndex].checkpoints[i]])) : getBestWorstEqualCps(cps)
    const ret: { marker: ('faster' | 'slower' | 'you' | null), infoPosition: number | undefined, cpTypes: ('best' | 'worst' | 'equal' | undefined)[] }[] = []
    for (const [i, e] of records.entries()) {
      let marker: 'faster' | 'slower' | 'you' | null = null
      if (TM.getPlayer(records?.[i]?.login) !== undefined && arr?.[i]?.[0] !== true) {
        if (i < playerRecordIndex) { // Player faster than your record
          marker = 'faster'
        } else if (i > playerRecordIndex) { // Player slower than your record
          marker = 'slower'
        } else {
          marker = 'you'
        }
      }
      ret.push({ marker, infoPosition: detailedInfos.find(a => a.index === i)?.position, cpTypes: cpTypes[i] })
    }
    return ret
  }

  private contructRecordInfo = (width: number, rowHeight: number, index: number, record: FinishInfo, cpTypes: ('best' | 'worst' | 'equal' | undefined)[]): string => {
    const margin = CONFIG.static.marginSmall
    const bg = CONFIG.recordInfo.bgColor
    const headerBg = CONFIG.staticHeader.bgColor
    const squareW = CONFIG.staticHeader.squareWidth
    const iconPadding = CONFIG.staticHeader.iconHorizontalPadding
    const iconW = CONFIG.staticHeader.iconWidth
    const icon = stringToObjectProperty(CONFIG.recordInfo.icon, ICONS)
    const actionId = this.id + 2 + index
    let xml = `<quad posn="0 0 1" sizen="${squareW} ${rowHeight - margin}" bgcolor="${headerBg}" action="${actionId}"/>
    <quad posn="${iconPadding} -${margin / 2} 2" sizen="${iconW} ${rowHeight - (margin * 2)}" image="${icon}" action="${actionId}"/>
    <quad posn="${squareW + margin} 0 1" sizen="${(width - (squareW + margin)) - margin} ${rowHeight - margin}" bgcolor="${headerBg}" action="${actionId}"/>
    ${centeredText(record.login, ((width - (squareW + margin)) / 2) - margin, rowHeight - margin, { padding: 0.2, xOffset: squareW + margin, textScale: 0.8 })}`
    const w = width / this.detailedInfoColumns
    const colours = {
      best: '0F0F',
      worst: 'F00F',
      equal: 'FF0F'
    }
    for (let i = 0; i < this.detailedInfoRows; i++) {
      for (let j = 0; j < this.detailedInfoColumns; j++) {
        const cpTime = record.checkpoints?.[(i * this.detailedInfoColumns) + j]
        if (cpTime === undefined) { break }
        let colour = 'FFFF'
        const type = cpTypes?.[(i * this.detailedInfoColumns) + j]
        if (type !== undefined) {
          colour = (colours as any)[type]
        }
        xml += `<quad posn="${w * j} -${rowHeight * (i + 1)} 1" sizen="${w - margin} ${rowHeight - margin}" bgcolor="${bg}" action="${actionId}"/>
        <format textcolor="${colour}"/>
        ${centeredText(TM.Utils.getTimeString(cpTime), w - margin, rowHeight - margin, { xOffset: w * j, yOffset: rowHeight * (i + 1), padding: 0.2, textScale: 0.7 })}`
      }
    }
    return xml
  }

}
