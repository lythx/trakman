import { trakman as tm } from '../../../src/Trakman.js'
import IDS from '../config/UtilIds.js'
import raceConfig from './RecordListRace.config.js'
import resultConfig from './RecordListResult.config.js'

interface UiRecord {
  readonly time: number
  readonly login?: string
  readonly name?: string
  readonly date?: Date
  readonly checkpoints?: number[]
  readonly url?: string
}

type Marker = 'faster' | 'slower' | 'you' | null

type TimeColour = 'slower' | 'faster' | 'top' | 'you'

export default class RecordList {

  readonly iCols: number
  readonly iColW: number
  readonly iIconW: number
  readonly iIcon: string
  readonly iBg: string
  readonly bg: string
  readonly headerBg: string
  readonly colGap: number
  readonly rowGap: number
  readonly format: string
  readonly markerWidth: number
  readonly iconVPadding: number
  readonly iconHPadding: number
  readonly id: number
  readonly config
  iRows: number = 0
  isFullRow: boolean = false
  readonly columnWidths: number[]
  readonly rows: number
  readonly rowHeight: number
  readonly width: number
  readonly side: boolean
  readonly topCount: number
  readonly maxCount: number
  readonly infos: { login: string, indexes: number[] }[] = []
  readonly markers: { readonly you: string; readonly faster: string; readonly slower: string; }
  readonly noRecordEntry: boolean
  readonly getColoursFromPb: boolean
  readonly downloadIcon: string
  readonly clickListeners: Function[] = []
  readonly timeColours: {
    slower: string;
    faster: string;
    you: string;
    top: string;
  }

  constructor(id: number, width: number, height: number, rows: number, side: boolean, topCount: number, maxCount: number, noRecordEntry: boolean,
    options?: { getColoursFromPb?: true, resultMode?: true }) {
    this.config = options?.resultMode === true ? resultConfig : raceConfig
    const INFO = this.config.info
    this.colGap = this.config.columnGap
    this.rowGap = this.config.rowGap
    this.iCols = INFO.columns
    this.iColW = INFO.columnWidth
    this.iIconW = INFO.iconWidth
    this.iIcon = INFO.icon
    this.markerWidth = this.config.markerWidth
    this.iconVPadding = this.config.iconVerticalPadding
    this.iconHPadding = this.config.iconHorizontalPadding
    this.downloadIcon = this.config.downloadIcon
    this.timeColours = this.config.timeColours
    this.id = id
    this.rows = rows
    this.rowHeight = (height + this.rowGap) / rows
    this.width = width
    this.side = side
    this.topCount = topCount
    this.maxCount = maxCount
    this.markers = side ? this.config.markersRight : this.config.markersLeft
    const columnProportions: number[] = this.config.columnProportions
    const proportionsSum: number = columnProportions.reduce((acc, cur): number => acc += cur, 0)
    this.columnWidths = columnProportions.map(a => (a / proportionsSum) * (width + this.colGap))
    this.noRecordEntry = noRecordEntry
    this.getColoursFromPb = options?.getColoursFromPb ?? false
    this.setupListeners()
    this.iBg = INFO.bgColor
    this.bg = this.config.background
    this.headerBg = this.config.headerBackground
    this.format = this.config.format
  }

  onClick(callback: Function): void {
    this.clickListeners.push(callback)
  }

  constructXml(login: string, allRecords: UiRecord[]): string {
    const cpAmount: number = allRecords?.[0]?.checkpoints?.length ?? 0
    this.iRows = Math.ceil(cpAmount / this.iCols) + 1
    const records = this.getDisplayedRecords(login, allRecords)
    const info = this.infos.find(a => a.login === login)
    const [infos, infoPositions, cpTypes] = info !== undefined ? this.getInfos(login, cpAmount, info, records) : [[], [], []]
    const playerIndex: number = records.map(a => a.record).findIndex(a => a.login === login)
    const markers: Marker[] = this.getMarkers(playerIndex, infoPositions, records.map(a => a.record))
    const timeColours = this.getTimeColours(login, playerIndex, records.map(a => a.record))
    let ret: string = `<quad posn="-70 50 -100" sizen="140 100" action="${IDS.ClearAlerts}"/>`
    for (let i: number = 0; i < this.rows; i++) {
      const info = infos.find(a => a.index === i)
      ret += `<frame posn="0 ${-(this.rowHeight * i)} 1">`
      if (records?.[i]?.record?.time === -1) {
        ret += `<quad posn="0 0 5" sizen="${this.width} ${this.rowHeight}" action="${this.id}"/>`
      } else {
        ret += `<quad posn="0 0 5" sizen="${this.width} ${this.rowHeight}" action="${this.id + 2 + i}"/>`
      }
      if (info !== undefined && records?.[i] !== undefined && records?.[i]?.record?.time !== -1) {
        ret += this.constructInfo(info.offset, records?.[i]?.record, cpTypes?.[i])
      } else {
        ret += this.constructMarker(markers?.[i])
      }
      ret += this.constructIndex(records?.[i]?.index) +
        this.constructTime(records?.[i]?.record?.time, timeColours?.[i]) +
        this.constructName(records?.[i]?.record?.name) +
        '</frame>'
    }
    return ret
  }

  private setupListeners(): void {
    tm.addListener('ManialinkClick', (info: ManialinkClickInfo): void => {
      if (info.actionId === IDS.ClearAlerts) {
        const index: number = this.infos.findIndex(a => a.login === info.login)
        if (index !== -1) {
          this.infos.splice(index, 1)
        }
        for (const e of this.clickListeners) {
          e(info)
        }
      }
      if (info.actionId > this.id + 1 && info.actionId <= this.id + this.maxCount + 1) {
        const index: number = info.actionId - this.id - 2
        const i = this.infos.find(a => a.login === info.login)
        if (i === undefined) {
          this.infos.push({ login: info.login, indexes: [index] })
        } else if (!i.indexes.includes(index)) {
          i.indexes.push(index)
        } else {
          const index: number = i.indexes.indexOf(info.actionId - this.id - 2)
          if (index !== -1) {
            i.indexes.splice(index, 1)
          }
        }
        for (const e of this.clickListeners) {
          e(info)
        }
      }
    })
  }

  private getDisplayedRecords(login: string, records: UiRecord[]): { index: number, record: UiRecord }[] {
    const playerRecord: UiRecord | undefined = records.find(a => a.login === login)
    const playerRecordIndex: number = playerRecord !== undefined ? records.indexOf(playerRecord) : -1
    const diff: number = this.rows - this.topCount
    const ret: { index: number, record: UiRecord }[] = []
    for (const [i, e] of records.entries()) {
      if (ret.length === this.rows || (this.noRecordEntry === true && playerRecord === undefined && ret.length === this.rows - 1)) { break }
      else if (i < this.topCount ||
        (this.noRecordEntry === true && playerRecord === undefined && i + diff > records.length)
        || (playerRecord !== undefined && (i + diff / 2 >= playerRecordIndex || i + diff >= records.length))) {
        ret.push({ index: i, record: e })
      }
    }
    if (this.noRecordEntry === true && playerRecord === undefined) {
      const player: TM.Player | undefined = tm.players.get(login)
      if (player !== undefined) {
        ret.push({ index: -1, record: { name: player.nickname, time: -1 } })
      }
    }
    return ret
  }

  private getInfos(login: string, cpAmount: number, info: { login: string, indexes: number[] }, records: { record: UiRecord, index: number }[]): [{ index: number, offset: number }[], boolean[][], ('best' | 'worst' | 'equal' | undefined)[][]] {
    const cps: number[][] = Array.from(Array(cpAmount), (): never[] => [])
    const infos: { index: number, offset: number }[] = []
    const infoPositions: boolean[][] = Array.from(Array(records.length), (): any[] => new Array(Math.ceil(cpAmount / this.iCols) + 1).fill(false))
    for (const [i, e] of records.entries()) {
      if (info.indexes.includes(i)) {
        if (e.record.checkpoints !== undefined) {
          for (const [j, cp] of e.record.checkpoints.entries()) {
            cps[j][i] = cp
          }
        }
        const freeIndex: number = infoPositions[i].indexOf(false)
        infos.push({ index: i, offset: freeIndex })
        for (let j: number = 0; j < this.iRows; j++) {
          if (infoPositions?.[i + j] !== undefined) { infoPositions[i + j][freeIndex] = true }
        }
      }
    }
    return this.isFullRow === false ? [infos, infoPositions.map(a => a.slice(0, a.length - 1)), this.getCpTypes(login, cps, records.map(a => a.record))] : [infos, infoPositions, this.getCpTypes(login, cps, records.map(a => a.record))]
  }

  private getCpTypes = (login: string, cps: number[][], records: UiRecord[]): ('best' | 'worst' | 'equal' | undefined)[][] => {
    if (cps.length === 0 || cps?.[0]?.length === 0) {
      return []
    }
    const cpTypes: ('best' | 'worst' | 'equal' | undefined)[][] = Array.from(Array(cps[0].length), (): any[] => new Array(cps.length).fill(null))
    if (cps?.[0]?.filter(a => a !== undefined)?.length === 1) {
      const c: number[] | undefined = records.find(a => a.login === login)?.checkpoints
      const index: number = cps[0].length - 1
      if (c !== undefined) {
        for (const [i, e] of cps.map(a => a[index]).entries()) {
          if (e > c[i]) {
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
      const max: number = Math.max(...e.filter(a => !isNaN(a)))
      const worst: number[] = e.filter(a => a === max)
      const min: number = Math.min(...e.filter(a => !isNaN(a)))
      const best: number[] = e.filter(a => a === min)
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

  private getMarkers(playerIndex: number, infoPositions: boolean[][], records: UiRecord[]): Marker[] {
    const ret: Marker[] = []
    for (let i: number = 0; i < records.length; i++) {
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
        const player: TM.Player | undefined = tm.players.get(login)
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

  private getTimeColours(login: string, playerIndex: number, records: UiRecord[]): ('slower' | 'faster' | 'top' | 'you')[] {
    const ret: ('slower' | 'faster' | 'top' | 'you')[] = []
    if (this.getColoursFromPb === true && playerIndex === -1) {
      const pb: number | undefined = tm.records.local.find(a => a.login === login)?.time
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

  private constructInfo(offset: number, record: UiRecord, cpTypes: ("best" | "worst" | "equal" | undefined)[]): string {
    let ret: string = ''
    const width: number = this.iColW * this.iCols
    const h: number = this.rowHeight - this.rowGap
    const w: number = width - this.iIconW
    let posX: number
    if (this.side === true) {
      posX = -(width + (this.colGap * 2) + (offset * (width + this.colGap))) + this.colGap
      const arr: (string | undefined)[] = [record.login, record.date, record.url].map(a => {
        return a instanceof Date ? tm.utils.formatDate(a, true) : a
      })
      const topInfo: any = arr.filter(a => a !== undefined)
      ret += `<quad posn="${posX} 0 1" sizen="${this.iIconW} ${h}" bgcolor="${this.headerBg}"/>
      <quad posn="${posX + this.iconHPadding} ${-this.iconVPadding} 6" sizen="${this.iIconW - (this.iconHPadding * 2)} ${h - (this.iconVPadding * 2)}" image="${this.iIcon}"/>`
      if (topInfo.length === 3) {
        ret += `<quad posn="${posX} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${this.rowHeight}" bgcolor="${this.headerBg}"/>
        <quad posn="${posX + this.iIconW + this.colGap} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${this.rowHeight}" bgcolor="${this.headerBg}"/>
        <quad posn="${posX + ((width - this.iIconW) / 2)} 0 1" sizen="${this.iIconW} ${this.rowHeight}" image="${this.iIcon}"/>`
      } else if (topInfo.length === 2 && record.url !== undefined) {
        ret += `<quad posn="${posX + this.iIconW + this.colGap} 0 1" sizen="${width - ((this.iIconW + this.colGap) * 2)} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[0], width - ((this.iIconW * 2) + this.colGap), h, posX + this.iIconW + this.colGap)}
        <quad posn="${posX + this.iIconW + this.colGap + (width - ((this.iIconW + this.colGap) * 2)) + this.colGap} 0 1" sizen="${this.iIconW} ${h}" bgcolor="${this.headerBg}" url="${topInfo[1].replace(/^https:\/\//, '')}"/>
        <quad posn="${posX + this.iIconW + this.iconHPadding + this.colGap + (width - ((this.iIconW + this.colGap) * 2)) + this.colGap} ${-this.iconVPadding} 6" sizen="${this.iIconW - (this.iconHPadding * 2)} ${h - (this.iconVPadding * 2)}" image="${this.downloadIcon}"/>`
      } else if (topInfo.length === 2) {
        ret += `<quad posn="${posX + this.iIconW + this.colGap} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[0], ((width - this.iIconW) / 2) - this.colGap, h, posX + this.iIconW + this.colGap)}
        <quad posn="${posX + this.iIconW + this.colGap + ((width - this.iIconW) / 2)} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[1], ((width - this.iIconW) / 2) - this.colGap, h, posX + this.iIconW + this.colGap + ((width - this.iIconW) / 2))}`
      } else {
        ret += `<quad posn="${posX + this.iIconW + this.colGap} 0 1" sizen="${w - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[0], w - this.colGap, h, posX + this.iIconW + this.colGap)}`
      }
    }
    else {
      posX = this.columnWidths.reduce((acc, cur): number => acc + cur, 0) + (offset * (width + this.colGap))
      const arr: (string | undefined)[] = [record.login, record.date, record.url].map(a => {
        return a instanceof Date ? tm.utils.formatDate(a, true) : a
      })
      const topInfo: any = arr.filter(a => a !== undefined)
      if (topInfo.length === 3) {
        ret += `<quad posn="${posX} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        <quad posn="${posX + ((width - this.iIconW) / 2)} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        <quad posn="${posX + (width - this.iIconW)} 0 1" sizen="${this.iIconW} ${h}" image="${this.iIcon}"/>`
      } else if (topInfo.length === 2 && record.url === undefined) {
        ret += `<quad posn="${posX} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[0], ((width - this.iIconW) / 2) - this.colGap, h, posX)}
        <quad posn="${posX + ((width - this.iIconW) / 2)} 0 1" sizen="${((width - this.iIconW) / 2) - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[1], ((width - this.iIconW) / 2) - this.colGap, h, posX + ((width - this.iIconW) / 2))}`
      } else if (topInfo.length === 2) {
        ret += `<quad posn="${posX} 0 1" sizen="${width - (this.iIconW + this.colGap)} ${h}" bgcolor="${this.headerBg}"/>
        <quad posn="${posX + (width - this.iIconW)} 0 1" sizen="${this.iIconW} ${h}" image="${this.iIcon}"/>`
      } else if (topInfo.length === 1) {
        ret += `<quad posn="${posX} 0 1" sizen="${w - this.colGap} ${h}" bgcolor="${this.headerBg}"/>
        ${this.centeredText(topInfo[0], w - this.colGap, h, posX)}`
      }
      ret += `<quad posn="${posX + w} 0 1" sizen="${this.iIconW} ${h}" bgcolor="${this.headerBg}"/>
      <quad posn="${posX + w + this.iconHPadding} ${-this.iconVPadding} 6" sizen="${this.iIconW - (this.iconHPadding * 2)} ${h - (this.iconVPadding * 2)}" image="${this.iIcon}"/>`
    }
    const cps: number[] | undefined = record.checkpoints
    const colours = {
      best: '0F0F',
      worst: 'F00F',
      equal: 'FF0F'
    }
    if (cps !== undefined) {
      for (let i: number = 0; i < cps.length / this.iCols; i++) {
        for (let j: number = 0; j < this.iCols; j++) {
          const cp: number = cps[(i * this.iCols) + j]
          if (cp === undefined) { break }
          let colour: string = 'FFFF'
          const type = cpTypes?.[(i * this.iCols) + j]
          if (type !== undefined) {
            colour = (colours as any)[type]
          }
          ret += `<quad posn="${posX + (this.iColW * j)} ${-this.rowHeight * (i + 1)} 1" sizen="${this.iColW - this.colGap} ${h}" bgcolor="${this.bg}"/>
          <format textcolor="${colour}"/>
          ${this.centeredText(tm.utils.getTimeString(cp), this.iColW - this.colGap, h, posX + (this.iColW * j), this.rowHeight * (i + 1))}
          <format textcolor="FFFF"/>`
        }
      }
    }
    return ret
  }

  private constructMarker(marker: Marker | undefined): string {
    if (marker === undefined || marker === null) { return '' }
    const posX: number = this.side === false ? this.columnWidths.reduce((acc, cur): number => acc + cur, 0) : -(this.markerWidth + this.colGap)
    let icon: string = ''
    if (marker === 'faster') {
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" image="${this.markers.faster}"/>`
    } if (marker === 'slower') {
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" image="${this.markers.slower}"/>`
    } if (marker === 'you') {
      icon += `<quad posn="${posX} 0 2" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" image="${this.markers.you}"/>`
    }
    return `<quad posn="${posX} 0 1" sizen="${this.markerWidth} ${this.rowHeight - this.rowGap}" bgcolor="${this.bg}"/>
    ${icon}`
  }

  private constructIndex(index: number | undefined): string {
    const posX: number = 0
    const height: number = this.rowHeight - this.rowGap
    const width: number = this.columnWidths[0] - this.colGap
    const n: string = index === undefined ? '' : `${(index + 1)}`
    return `<quad posn="${posX} 0  1" sizen="${width} ${height}" bgcolor="${this.headerBg}"/>
      ${this.centeredText((index === -1 ? '-' : n), width, height, posX)}`
  }

  private constructTime(time: number | undefined, timeColour: TimeColour | undefined): string {
    const posX: number = this.columnWidths[0]
    const height: number = this.rowHeight - this.rowGap
    const width: number = this.columnWidths[1] - this.colGap
    const colour: string = timeColour === undefined ? 'FFFF' : (this.timeColours)[timeColour]
    const t: string = (`${time === undefined ? '' : tm.utils.getTimeString(time)}`).toString()
    return `<quad posn="${posX} 0 1" sizen="${width} ${height}" bgcolor="${this.bg}"/>
    <format textsize="1" textcolor="${time === -1 ? this.timeColours.you : colour}"/>
    ${this.centeredText(time === -1 ? '-:--.--' : t, width, height, posX)}
    <format textsize="1" textcolor="FFFF"/>`
  }

  private constructName(name: string | undefined): string {
    const posX: number = this.columnWidths[0] + this.columnWidths[1]
    const height: number = this.rowHeight - this.rowGap
    const width: number = this.columnWidths[2] - this.colGap
    return `<quad posn="${posX} 0 1" sizen="${width} ${height}" bgcolor="${this.bg}"/>
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
