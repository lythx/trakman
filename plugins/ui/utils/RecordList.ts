import IDS from '../config/UtilIds.js'
import raceConfig from './RecordListRace.config.js'
import resultConfig from './RecordListResult.config.js'

/**
 * Record list image object
 */
export interface RLImage {
  /** Image url */
  url: string,
  /** Optional horizontal padding, relative to the parent element */
  horizontalPadding?: number
  /** Optional vertical padding, relative to the parent element */
  verticalPadding?: number
}
/** 
 * Record list record object
 */
export interface RLRecord {
  /** Record time */
  time: number
  /** Text to display instead of time */
  text?: string
  /** Player login (displayed on click) */
  login?: string
  /** Player name */
  name?: string
  /** Record date (displayed on click) */
  date?: Date
  /** Record checkpoints (displayed after click) */
  checkpoints?: (number | undefined)[]
  /** If set the menu displayed on click will have a button redirecting to given url */
  url?: string
  /** Points amount displayed next to the record */
  points?: number
  /** Points amount background colour */
  colour?: string
  /** Image to display instead of time */
  image?: RLImage
  /** Custom marker image to display instead of default marker */
  markerImage?: RLImage
}

type Marker = 'faster' | 'slower' | 'you' | { points: number, colour?: string, image?: RLImage } | null

type TimeColour = 'slower' | 'faster' | 'top' | 'you'

/**
 * Util to display record data in manialinks. 
 * It has index, name and time columns, but it also can display more data on click eg. checkpoints.
 * Records and time colours are displayed relative to players personal record
 */
export default class RecordList {

  /** Info grid column count */
  readonly infoColumns: number
  /** Info grid column width */
  readonly infoColumnWidth: number
  /** Info icon width */
  readonly infoIconWidth: number
  /** Info icon url */
  readonly infoIcon: string
  /** Info background colour */
  readonly infoBackground: string
  /** Background colour */
  readonly background: string
  /** Header background colour */
  readonly headerBackground: string
  private readonly columnGap: number
  private readonly rowGap: number
  /** Marker width */
  readonly markerWidth: number
  private readonly iconVerticalPadding: number
  private readonly iconHorizontalPadding: number
  /** Parent element manialink ID */
  readonly parentId: number
  /** Present config used */
  readonly config
  private infoRows: number = 0
  private isFullRow: boolean = false
  /** List column widths */
  readonly columnWidths: number[]
  /** List row count */
  readonly rows: number
  /** List row height */
  readonly rowHeight: number
  /** List width */
  readonly width: number
  /** List side (true is right) */
  readonly side: boolean
  /** Number of records which are always displayed regardless of player personal record */
  readonly topCount: number
  private readonly maxCount: number
  private clickListener: (info: tm.ManialinkClickInfo) => void = () => undefined
  private readonly infos: { login: string, indexes: number[] }[] = []
  /** Marker icons */
  readonly markers: { readonly you: string; readonly faster: string; readonly slower: string; }
  private readonly noRecordEntry: boolean
  private readonly getColoursFromPb: boolean
  /** Download icon url */
  readonly downloadIcon: string
  private readonly clickListeners: ((info: tm.ManialinkClickInfo) => void)[] = []
  private readonly parseTime: boolean = true
  /** Time string colours */
  readonly timeColours: Readonly<{
    slower: string,
    faster: string,
    you: string,
    top: string
  }>
  private readonly noRecordEntryText: string
  private readonly maxCpCount: number

  /**
   * Util to display record data in manialinks. 
   * It has index, name and time columns, but it also can display more data on click eg. checkpoints.
   * Records and time colours are displayed relative to players personal record.
   * @param preset Default preset options to use
   * @param parentId Parent element manialink ID
   * @param width List width
   * @param height List height
   * @param rows List row count
   * @param side Side on which list is positioned needed for click info display (true is right)
   * @param topCount Number of records which are always displayed regardless of player personal record
   * @param maxCount Max record count needed for click actionIds
   * @param noRecordEntry If true, a placeholder entry gets displayed at the end of the list if the player has no personal record
   * @param options Optional parameters
   */
  constructor(preset: 'result' | 'race', parentId: number, width: number,
    height: number, rows: number, side: boolean, topCount: number, maxCount: number, noRecordEntry: boolean,
    options?: {
      getColoursFromPb?: true, dontParseTime?: boolean, columnProportions?: number[],
      noRecordEntryText?: string
    }) {
    this.config = preset === 'result' ? resultConfig : raceConfig
    const INFO = this.config.info
    this.columnGap = this.config.columnGap
    this.rowGap = this.config.rowGap
    this.infoColumns = INFO.columns
    this.infoColumnWidth = INFO.columnWidth
    this.infoIconWidth = INFO.iconWidth
    this.infoIcon = INFO.icon
    this.markerWidth = this.config.markerWidth
    this.iconVerticalPadding = this.config.iconVerticalPadding
    this.iconHorizontalPadding = this.config.iconHorizontalPadding
    this.downloadIcon = this.config.downloadIcon
    this.timeColours = this.config.timeColours
    this.parentId = parentId
    this.rows = rows
    this.rowHeight = (height + this.rowGap) / rows
    this.width = width
    this.side = side
    this.topCount = topCount
    this.maxCount = maxCount
    this.markers = side ? this.config.markersRight : this.config.markersLeft
    if (options?.columnProportions !== undefined &&
      (options.columnProportions.length < 3 || options.columnProportions.some(a => isNaN(a)))) {
      tm.log.fatal(`Expected 3 numbers in column proportions array in recordlist, received ${options.columnProportions}`)
    }
    const columnProportions: number[] = options?.columnProportions ?? this.config.columnProportions
    const proportionsSum: number = columnProportions.reduce((acc, cur): number => acc += cur, 0)
    this.columnWidths = columnProportions.map(a => (a / proportionsSum) * (width + this.columnGap))
    this.noRecordEntry = noRecordEntry
    this.getColoursFromPb = options?.getColoursFromPb ?? false
    this.setupListeners()
    this.infoBackground = INFO.bgColor
    this.background = this.config.background
    this.headerBackground = this.config.headerBackground
    this.noRecordEntryText = options?.noRecordEntryText ?? this.config.noRecordEntryText
    this.maxCpCount = this.config.maxCpCount
    if (options?.dontParseTime === true) {
      this.parseTime = false
    }
  }

  /**
   * Registers a callback function to execute on record click
   * @param callback Callback function, it takes ManialinkClickInfo as a parameter
   */
  onClick(callback: (info: tm.ManialinkClickInfo) => void): void {
    this.clickListeners.push(callback)
  }

  /**
   * Constructs record list XML for given player from passed array of record objects
   * @param login Player login
   * @param allRecords Array of record objects
   * @param pb Personal best time (if omitted current map pb will be used)
   * @returns Record list XML string
   */
  constructXml(login: string | undefined, allRecords: RLRecord[], pb?: number, indices?: number[]): string {
    const checkpointAmounts = allRecords.map(a =>
      a?.checkpoints?.length).filter(a => a !== undefined) as number[]
    const cpAmount: number = checkpointAmounts.length === 0 ? 0 : Math.max(...checkpointAmounts)
    this.infoRows = Math.ceil(cpAmount / this.infoColumns) + 1
    const parsedRecs = this.getDisplayedRecords(login, allRecords)
    const info = this.infos.find(a => a.login === login)
    const [infos, infoPositions, cpTypes] = info !== undefined ? this.getInfos(login, cpAmount, info, parsedRecs) : [[], [], []]
    const playerIndex: number = login === undefined ? -1 : parsedRecs.map(a => a.record).findIndex(a => a.login === login)
    const markers: Marker[] = this.getMarkers(playerIndex, infoPositions, parsedRecs.map(a => a.record))
    const timeColours = this.getTimeColours(login, playerIndex, parsedRecs.map(a => a.record), pb)
    let ret: string = `<quad posn="-70 50 -100" sizen="140 100" action="${IDS.ClearAlerts}"/>`
    for (let i: number = 0; i < this.rows; i++) {
      const info = infos.find(a => a.index === i)
      ret += `<frame posn="0 ${-(this.rowHeight * i)} 1">`
      if (parsedRecs?.[i]?.record?.time === -1) {
        ret += `<quad posn="0 0 5" sizen="${this.width} ${this.rowHeight}" action="${this.parentId}"/>`
      } else {
        ret += `<quad posn="0 0 5" sizen="${this.width} ${this.rowHeight}" action="${this.parentId + 2 + i}"/>`
      }
      if (info !== undefined && parsedRecs?.[i] !== undefined && parsedRecs?.[i]?.record?.time !== -1
        && (i + 1) * cpAmount < this.maxCpCount) {
        ret += this.constructInfo(info.offset, parsedRecs?.[i]?.record, cpTypes?.[i], cpAmount)
      } else {
        ret += this.constructMarker(markers?.[i])
      }
      const displayIndex = indices?.[i] ?? parsedRecs?.[i]?.index
      ret += this.constructIndex(displayIndex) +
        this.constructTime(parsedRecs?.[i]?.record?.time, timeColours?.[i],
          parsedRecs?.[i]?.record?.text, parsedRecs?.[i]?.record?.image) +
        this.constructName(parsedRecs?.[i]?.record?.name) +
        '</frame>'
    }
    return ret
  }

  /**
   * Unloads the click listener from memory
   */
  destroy(): void {
    tm.removeListener(this.clickListener)
  }

  private setupListeners(): void {
    this.clickListener = (info: tm.ManialinkClickInfo) => {
      if (info.actionId === IDS.ClearAlerts) {
        const index: number = this.infos.findIndex(a => a.login === info.login)
        if (index !== -1) {
          this.infos.splice(index, 1)
        }
        for (const e of this.clickListeners) {
          e(info)
        }
      }
      if (info.actionId > this.parentId + 1 && info.actionId <= this.parentId + this.maxCount + 1) {
        const index: number = info.actionId - this.parentId - 2
        const i = this.infos.find(a => a.login === info.login)
        if (i === undefined) {
          this.infos.push({ login: info.login, indexes: [index] })
        } else if (!i.indexes.includes(index)) {
          i.indexes.push(index)
        } else {
          const index: number = i.indexes.indexOf(info.actionId - this.parentId - 2)
          if (index !== -1) {
            i.indexes.splice(index, 1)
          }
        }
        for (const e of this.clickListeners) {
          e(info)
        }
      }
    }
    tm.addListener('ManialinkClick', this.clickListener)
  }

  private getDisplayedRecords(login: string | undefined, records: RLRecord[]): { index: number, record: RLRecord }[] {
    const playerRecord: RLRecord | undefined = records.find(a => a.login === login)
    const playerRecordIndex: number = playerRecord !== undefined ? records.indexOf(playerRecord) : -1
    const diff: number = this.rows - this.topCount
    const ret: { index: number, record: RLRecord }[] = []
    if (login === undefined) {
      for (let i = 0; i < records.length; i++) {
        ret.push({ index: i, record: records[i] })
      }
      return ret
    }
    for (const [i, e] of records.entries()) {
      if (ret.length === this.rows || (this.noRecordEntry && playerRecord === undefined && ret.length === this.rows - 1)) { break }
      else if (i < this.topCount ||
        (this.noRecordEntry && playerRecord === undefined && i + diff > records.length)
        || (playerRecord !== undefined && (i + diff / 2 >= playerRecordIndex || i + diff >= records.length))) {
        ret.push({ index: i, record: e })
      }
    }
    if (this.noRecordEntry && playerRecord === undefined) {
      const player: tm.Player | undefined = tm.players.get(login)
      if (player !== undefined) {
        ret.push({ index: -1, record: { name: player.nickname, time: -1 } })
      }
    }
    return ret
  }

  private getInfos(login: string | undefined, cpAmount: number, info: { login: string, indexes: number[] }, records: { record: RLRecord, index: number }[]): [{ index: number, offset: number }[], boolean[][], ('best' | 'worst' | 'equal' | undefined)[][]] {
    const cps: (number | undefined)[][] = Array.from(Array(cpAmount), (): never[] => [])
    const infos: { index: number, offset: number }[] = []
    const infoPositions: boolean[][] = Array.from(Array(records.length), (): any[] => new Array(Math.ceil(cpAmount / this.infoColumns) + 1).fill(false))
    for (const [i, e] of records.entries()) {
      if (info.indexes.includes(i)) {
        if (e.record.checkpoints !== undefined) {
          for (const [j, cp] of e.record.checkpoints.entries()) {
            cps[j][i] = cp
          }
        }
        const freeIndex: number = infoPositions[i].indexOf(false)
        infos.push({ index: i, offset: freeIndex })
        for (let j: number = 0; j < this.infoRows; j++) {
          if (infoPositions?.[i + j] !== undefined) { infoPositions[i + j][freeIndex] = true }
        }
      }
    }
    return !this.isFullRow ? [infos, infoPositions.map(a => a.slice(0, a.length - 1)), this.getCpTypes(login, cps, records.map(a => a.record))] : [infos, infoPositions, this.getCpTypes(login, cps, records.map(a => a.record))]
  }

  private getCpTypes = (login: string | undefined, cps: (number | undefined)[][], records: RLRecord[]): ('best' | 'worst' | 'equal' | undefined)[][] => {
    if (cps.length === 0 || cps?.[0]?.length === 0) {
      return []
    }
    const cpTypes: ('best' | 'worst' | 'equal' | undefined)[][] = Array.from(Array(cps[0].length), (): any[] => new Array(cps.length).fill(null))
    if (cps?.[0]?.filter(a => a !== undefined)?.length === 1) {
      const c: (number | undefined)[] | undefined = records.find(a => a.login === login)?.checkpoints
      const index: number = cps[0].length - 1
      if (c !== undefined) {
        for (const [i, e] of cps.map(a => a[index]).entries()) {
          if (e === undefined || c[i] !== undefined) { continue }
          if (e > (c[i] as unknown as number)) {
            cpTypes[index][i] = 'worst'
          } else if (e === c[i]) {
            cpTypes[index][i] = 'equal'
          } else {
            cpTypes[index][i] = 'best'
          }
        }
        return cpTypes
      }
    }
    for (const [i, e] of cps.entries()) {
      if (cps?.[0]?.length < 2) {
        break
      }
      const max: number = Math.max(...e.filter(a => !isNaN(a as any)) as number[])
      const worst: number[] = e.filter(a => a === max) as number[]
      const min: number = Math.min(...e.filter(a => !isNaN(a as any)) as number[])
      const best: number[] = e.filter(a => a === min) as number[]
      if (max === min) {
        continue
      }
      if (worst.length === 1) {
        cpTypes[e.indexOf(worst[0])][i] = 'worst'
      }
      if (best.length === 1) {
        cpTypes[e.indexOf(best[0])][i] = 'best'
      } else {
        const indexes: number[] = e.reduce((acc: number[], cur, i): number[] => cur === min ? [...acc, i] : acc, [])
        for (const index of indexes) {
          cpTypes[index][i] = 'equal'
        }
      }
    }
    return cpTypes
  }

  private getMarkers(playerIndex: number, infoPositions: boolean[][], records: RLRecord[]): Marker[] {
    const ret: Marker[] = []
    for (let i: number = 0; i < records.length; i++) {
      const points = records[i].points
      if (points !== undefined) {
        ret.push({ points: points, colour: records[i].colour, image: records[i].markerImage })
        continue
      }
      if (infoPositions?.[i]?.[0] === true) {
        ret.push(null)
        continue
      }
      if (playerIndex === i) {
        ret.push('you')
        continue
      }
      const login: string | undefined = records[i].login
      if (login !== undefined) {
        const player: tm.Player | undefined = tm.players.get(login)
        if (player !== undefined) {
          if (i < playerIndex || playerIndex === -1) {
            ret.push('slower')
          } else {
            ret.push('faster')
          }
          continue
        }
      }
      ret.push(null)
    }
    return ret
  }

  private getTimeColours(login: string | undefined, playerIndex: number, records: RLRecord[], personalBest?: number): ('slower' | 'faster' | 'top' | 'you')[] {
    const ret: ('slower' | 'faster' | 'top' | 'you')[] = []
    if (login === undefined) {
      for (let i: number = 0; i < records.length; i++) {
        ret.push('slower')
      }
    }
    if (this.getColoursFromPb && playerIndex === -1) {
      const pb: number | undefined = personalBest ?? tm.records.local.find(a => a.login === login)?.time
      if (pb !== undefined) {
        for (let i: number = 0; i < records.length; i++) {
          if (pb <= records?.[i]?.time) {
            ret.push('slower')
          } else if (i < this.topCount) {
            ret.push('top')
          } else {
            ret.push('faster')
          }
        }
        return ret
      }
    }
    if (playerIndex === -1) { playerIndex = Infinity }
    for (let i: number = 0; i < records.length; i++) {
      if (playerIndex === i) {
        ret.push('you')
      } else if (i < this.topCount) {
        ret.push('top')
      } else if (i > playerIndex) {
        ret.push('slower')
      } else {
        ret.push('faster')
      }
    }
    return ret
  }

  private constructInfo(offset: number, record: RLRecord, cpTypes: ("best" | "worst" | "equal" | undefined)[], cpAmount: number): string {
    let ret: string = ''
    const width: number = this.infoColumnWidth * this.infoColumns
    const h: number = this.rowHeight - this.rowGap
    const w: number = width - this.infoIconWidth
    let posX: number
    if (this.side) {
      posX = -(width + (this.columnGap * 2) + (offset * (width + this.columnGap))) + this.columnGap
      const arr: (string | undefined)[] = [record.login, record.date, record.url].map(a => {
        return a instanceof Date ? tm.utils.formatDate(a, true) : a
      })
      const topInfo: any = arr.filter(a => a !== undefined)
      ret += `<quad posn="${posX} 0 1" sizen="${this.infoIconWidth} ${h}" bgcolor="${this.headerBackground}"/>
      <quad posn="${posX + this.iconHorizontalPadding} ${-this.iconVerticalPadding} 6" 
      sizen="${this.infoIconWidth - (this.iconHorizontalPadding * 2)} ${h - (this.iconVerticalPadding * 2)}" image="${this.infoIcon}"/>`
      if (topInfo.length === 3) {
        ret += `<quad posn="${posX} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${this.rowHeight}" bgcolor="${this.headerBackground}"/>
        <quad posn="${posX + this.infoIconWidth + this.columnGap} 0 1" 
         sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${this.rowHeight}" bgcolor="${this.headerBackground}"/>
        <quad posn="${posX + ((width - this.infoIconWidth) / 2)} 0 1" 
         sizen="${this.infoIconWidth} ${this.rowHeight}" image="${this.infoIcon}"/>`
      } else if (topInfo.length === 2 && record.url !== undefined) {
        ret += `<quad posn="${posX + this.infoIconWidth + this.columnGap} 0 1"
         sizen="${width - ((this.infoIconWidth + this.columnGap) * 2)} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[0], width - ((this.infoIconWidth * 2) + this.columnGap), h, posX + this.infoIconWidth + this.columnGap)}
        <quad posn="${posX + this.infoIconWidth + this.columnGap + (width - ((this.infoIconWidth + this.columnGap) * 2)) + this.columnGap} 0 1"
         sizen="${this.infoIconWidth} ${h}" bgcolor="${this.headerBackground}" url="${tm.utils.fixProtocol(topInfo[1])}"/>
        <quad posn="${posX + this.infoIconWidth + this.iconHorizontalPadding + this.columnGap + (width - ((this.infoIconWidth + this.columnGap) * 2)) + this.columnGap} ${-this.iconVerticalPadding} 6"
         sizen="${this.infoIconWidth - (this.iconHorizontalPadding * 2)} ${h - (this.iconVerticalPadding * 2)}" image="${this.downloadIcon}"/>`
      } else if (topInfo.length === 2) {
        ret += `<quad posn="${posX + this.infoIconWidth + this.columnGap} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[0], ((width - this.infoIconWidth) / 2) - this.columnGap, h, posX + this.infoIconWidth + this.columnGap)}
        <quad posn="${posX + this.infoIconWidth + this.columnGap + ((width - this.infoIconWidth) / 2)} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[1], ((width - this.infoIconWidth) / 2) - this.columnGap, h, posX + this.infoIconWidth + this.columnGap + ((width - this.infoIconWidth) / 2))}`
      } else {
        ret += `<quad posn="${posX + this.infoIconWidth + this.columnGap} 0 1" sizen="${w - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[0], w - this.columnGap, h, posX + this.infoIconWidth + this.columnGap)}`
      }
    }
    else {
      posX = this.columnWidths.reduce((acc, cur): number => acc + cur, 0) + (offset * (width + this.columnGap))
      const arr: (string | undefined)[] = [record.login, record.date, record.url].map(a => {
        return a instanceof Date ? tm.utils.formatDate(a, true) : a
      })
      const topInfo: any = arr.filter(a => a !== undefined)
      if (topInfo.length === 3) {
        ret += `<quad posn="${posX} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        <quad posn="${posX + ((width - this.infoIconWidth) / 2)} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        <quad posn="${posX + (width - this.infoIconWidth)} 0 1" sizen="${this.infoIconWidth} ${h}" image="${this.infoIcon}"/>`
      } else if (topInfo.length === 2 && record.url === undefined) {
        ret += `<quad posn="${posX} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[0], ((width - this.infoIconWidth) / 2) - this.columnGap, h, posX)}
        <quad posn="${posX + ((width - this.infoIconWidth) / 2)} 0 1" sizen="${((width - this.infoIconWidth) / 2) - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[1], ((width - this.infoIconWidth) / 2) - this.columnGap, h, posX + ((width - this.infoIconWidth) / 2))}`
      } else if (topInfo.length === 2) {
        ret += `<quad posn="${posX} 0 1" sizen="${width - (this.infoIconWidth + this.columnGap)} ${h}" bgcolor="${this.headerBackground}"/>
        <quad posn="${posX + (width - this.infoIconWidth)} 0 1" sizen="${this.infoIconWidth} ${h}" image="${this.infoIcon}"/>`
      } else if (topInfo.length === 1) {
        ret += `<quad posn="${posX} 0 1" sizen="${w - this.columnGap} ${h}" bgcolor="${this.headerBackground}"/>
        ${this.centeredText(topInfo[0], w - this.columnGap, h, posX)}`
      }
      ret += `<quad posn="${posX + w} 0 1" sizen="${this.infoIconWidth} ${h}" bgcolor="${this.headerBackground}"/>
      <quad posn="${posX + w + this.iconHorizontalPadding} ${-this.iconVerticalPadding} 6" sizen="${this.infoIconWidth - (this.iconHorizontalPadding * 2)} ${h - (this.iconVerticalPadding * 2)}" image="${this.infoIcon}"/>`
    }
    const cps: (number | undefined)[] | undefined = record.checkpoints
    const colours = {
      best: `${tm.utils.palette.green}F`,
      worst: `${tm.utils.palette.red}F`,
      equal: `${tm.utils.palette.yellow}F`
    }
    if (cps !== undefined) {
      for (let i: number = 0; i < cps.length / this.infoColumns; i++) {
        for (let j: number = 0; j < this.infoColumns; j++) {
          const cp: number | undefined = cps[(i * this.infoColumns) + j]
          let colour: string = 'FFFF'
          if ((i * this.infoColumns) + j >= cpAmount) { break }
          const type = cpTypes?.[(i * this.infoColumns) + j]
          if (type !== undefined) {
            colour = (colours as any)[type]
          }
          ret += `<quad posn="${posX + (this.infoColumnWidth * j)} ${-this.rowHeight * (i + 1)} 1" sizen="${this.infoColumnWidth - this.columnGap} ${h}" bgcolor="${this.background}"/>
          <format textcolor="${colour}"/>
          ${this.centeredText(cp === undefined ? this.noRecordEntryText : tm.utils.getTimeString(cp),
            this.infoColumnWidth - this.columnGap, h, posX + (this.infoColumnWidth * j), this.rowHeight * (i + 1))}
          <format textcolor="FFFF"/>`
        }
      }
    }
    return ret
  }

  private constructMarker(marker: Marker | undefined): string {
    if (marker === undefined || marker === null) { return '' }
    const posX: number = !this.side ? this.columnWidths.reduce((acc, cur): number => acc + cur, 0) : -(this.markerWidth + this.columnGap)
    let icon: string = ''
    if (typeof marker === 'object') {
      const color = marker.colour === undefined ? '' : `bgcolor="${marker.colour}"`
      let content: string
      if (marker.image !== undefined) {
        const vpadding = marker.image.verticalPadding ?? 0
        const hpadding = marker.image.horizontalPadding ?? 0
        content = `<quad posn="${posX + hpadding} ${-vpadding} 2"
         sizen="${this.markerWidth - hpadding * 2} ${this.rowHeight - (this.rowGap + vpadding * 2)}" image="${marker.image.url}"/>`
      } else {
        content = this.centeredText(marker.points.toString(), this.markerWidth, this.rowHeight - this.rowGap, posX)
      }
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" ${color}/>
      ${content}`
    } else if (marker === 'faster') {
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" image="${this.markers.faster}"/>`
    } else if (marker === 'slower') {
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" image="${this.markers.slower}"/>`
    } else if (marker === 'you') {
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" image="${this.markers.you}"/>`
    }
    return `<quad posn="${posX} 0 1" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" bgcolor="${this.background}"/>
    ${icon}`
  }

  private constructIndex(index: number | undefined): string {
    const posX: number = 0
    const height: number = this.rowHeight - this.rowGap
    const width: number = this.columnWidths[0] - this.columnGap
    const n: string = index === undefined ? '' : `${(index + 1)}`
    const di: string = index === -1 ? '-' : index === Infinity ? 'F' : n
    return `<quad posn="${posX} 0  1" sizen="${width} ${height}" bgcolor="${this.headerBackground}"/>
      ${this.centeredText(di, width, height, posX)}`
  }

  private constructTime(time: number | undefined, timeColour: TimeColour | undefined,
    text: string | undefined, image: RLImage | undefined): string {
    const posX: number = this.columnWidths[0]
    const height: number = this.rowHeight - this.rowGap
    const width: number = this.columnWidths[1] - this.columnGap
    const colour: string = timeColour === undefined ? 'FFFF' : (this.timeColours)[timeColour]
    const t: string = (`${time === undefined ? '' : (this.parseTime ? tm.utils.getTimeString(time) : time)}`).toString()
    let content: string
    if (image !== undefined) {
      const vpadding = image.verticalPadding ?? 0
      const hpadding = image.horizontalPadding ?? 0
      content = `<quad posn="${posX + hpadding} ${-vpadding} 2"
       sizen="${width - hpadding * 2} ${height - vpadding * 2}" image="${image.url}"/>`
    } else {
      content = this.centeredText(text ?? (time === -1 ? this.noRecordEntryText : t), width, height, posX)
    }
    return `<quad posn="${posX} 0 1" sizen="${width} ${height}" bgcolor="${this.background}"/>
    <format textsize="1" textcolor="${time === -1 ? this.timeColours.you : colour}"/>
    ${content}
    <format textsize="1" textcolor="FFFF"/>`
  }

  private constructName(name: string | undefined): string {
    const posX: number = this.columnWidths[0] + this.columnWidths[1]
    const height: number = this.rowHeight - this.rowGap
    const width: number = this.columnWidths[2] - this.columnGap
    return `<quad posn="${posX} 0 1" sizen="${width} ${height}" bgcolor="${this.background}"/>
    ${this.verticallyCenteredText((`${tm.utils.strip(name ?? '', false)}`), width, height, posX)}`
  }

  private centeredText = (text: string, parentWidth: number, parentHeight: number, xOffset: number, yOffset: number = 0): string => {
    const textScale: number = this.config.textScale
    const padding: number = this.config.padding
    const posX: number = (parentWidth / 2) + xOffset
    const posY: number = (parentHeight / 2) + yOffset
    return `<label posn="${posX} -${posY} 3" sizen="${(parentWidth * (1 / textScale)) - (padding * 2)} ${parentHeight}" scale="${textScale}" text="${this.config.format}${tm.utils.safeString(text)}" valign="center" halign="center"/>`
  }

  private verticallyCenteredText = (text: string, parentWidth: number, parentHeight: number, xOffset: number): string => {
    const textScale: number = this.config.textScale
    const padding: number = this.config.padding
    const posX: number = xOffset + padding
    const posY: number = parentHeight / 2
    return `<label posn="${posX} -${posY} 3" sizen="${((parentWidth - (padding * 2)) * (1 / textScale))} ${parentHeight}" scale="${textScale}" text="${this.config.format}${tm.utils.safeString(text)}" valign="center"/>`
  }

}
