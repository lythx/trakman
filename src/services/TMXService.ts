import fetch from 'node-fetch'
import { ErrorHandler } from '../ErrorHandler.js'
import { JukeboxService } from './JukeboxService.js'
import 'dotenv/config'

export abstract class TMXService {

  private static readonly _previous: (TMXMapInfo | null)[] = []
  private static _current: TMXMapInfo | null
  private static readonly _next: (TMXMapInfo | null)[] = []
  private static readonly prefixes: string[] = ['tmnforever', 'united', 'nations', 'original', 'sunrise']
  private static readonly nextSize: number = 4
  private static readonly previousSize: number = 4

  static async initialize(): Promise<void> {
    if (process.env.USE_TMX !== 'YES') { return }
    const current: TMXMapInfo | Error = await this.fetchMapInfo(JukeboxService.current.id)
    this._current = current instanceof Error ? null : current
    for (let i: number = 0; i < Math.min(JukeboxService.queue.length, this.nextSize); i++) {
      const id: string = JukeboxService.queue[i].id
      const map: TMXMapInfo | Error = await this.fetchMapInfo(id)
      this._next.push(map instanceof Error ? null : map)
    }
  }

  static async nextMap(): Promise<void | Error> {
    if (process.env.USE_TMX !== 'YES') { return }
    this._previous.unshift(this._current)
    this._previous.length = Math.min(this._previous.length, this.previousSize)
    const next: TMXMapInfo | null | undefined = this._next.shift()
    if (next === undefined) {
      ErrorHandler.error(`TMX didn't get prefetched for some reason, this should never happen`)
      return
    }
    this._current = next
    const replays: TMXReplay[] | undefined = this._current?.replays
    if (replays !== undefined && replays.length > 0) {
      // for (let i: number = 0; i < Math.min(3, replays.length); i++) {
      //   const res = await fetch(replays[i].url).catch((err: Error) => err)
      //   if (!(res instanceof Error)) {
      //     const file: ArrayBuffer = await res.arrayBuffer()
      //   }
      // }
    }
    const map: TMXMapInfo | Error = await this.fetchMapInfo(JukeboxService.queue[this.nextSize - 1].id)
    this._next.push(map instanceof Error ? null : map)
  }

  static restartMap(): void {
    if (process.env.USE_TMX !== 'YES') { return }
    this._previous.unshift(this._current === null ? null : { ...this._current })
    this._previous.length = Math.min(this._previous.length, this.previousSize)
  }

  static async add(id: string, index: number): Promise<void | Error> {
    if (process.env.USE_TMX !== 'YES' || index >= this.nextSize) { return }
    const map: TMXMapInfo | Error = await this.fetchMapInfo(id)
    this._next.splice(index, 0, map instanceof Error ? null : map)
    this._next.length = this.nextSize
  }

  static async remove(index: number): Promise<void> {
    if (process.env.USE_TMX !== 'YES' || index >= this.nextSize) { return }
    this._next.splice(index, 1)
    const map: TMXMapInfo | Error = await this.fetchMapInfo(JukeboxService.queue[this.nextSize - 1].id)
    this._next.push(map instanceof Error ? null : map)
  }

  static get current(): TMXMapInfo | null {
    if (process.env.USE_TMX !== 'YES') { return null }
    return this._current === null ? null : { ...this._current }
  }

  static get next(): (TMXMapInfo | null)[] {
    if (process.env.USE_TMX !== 'YES') { return new Array(this.nextSize).fill(null) }
    return [...this._next]
  }

  static get previous(): (TMXMapInfo | null)[] {
    if (process.env.USE_TMX !== 'YES') { return new Array(this.previousSize).fill(null) }
    return [...this._previous]
  }

  /**
   * Fetches map gbx file from tmx by map id, returns name and file in base64 string
   */
  static async fetchMapFile(id: number, game: string = 'TMNF'): Promise<TMXFileData | Error> {
    if (process.env.USE_TMX !== 'YES') { return new Error('TMX is not enabled in .env file') }
    const prefix: string = this.prefixes[['TMNF', 'TMU', 'TMN', 'TMO', 'TMS'].indexOf(game)]
    const res = await fetch(`https://${prefix}.tm-exchange.com/trackgbx/${id}`).catch((err: Error) => err)
    if (res instanceof Error) {
      ErrorHandler.error(res.message)
      return res
    }
    const nameHeader: string | null = res.headers.get('content-disposition')
    if (nameHeader === null) { return new Error('Cannot read map name') }
    // The header is inconsistent for some reason, I hate TMX
    const name: string = nameHeader[21] === '"' ? nameHeader.substring(22).split('"; filename*=')[0] : nameHeader.substring(21).split('; filename*=')[0]
    const data: ArrayBuffer = await res.arrayBuffer()
    const buffer: Buffer = Buffer.from(data)
    return { name, content: buffer }
  }

  /**
   * Fetches map gbx file from tmx by uid, returns name and file in base64 string
   */
  static async fetchMapFileByUid(mapId: string): Promise<TMXFileData | Error> {
    if (process.env.USE_TMX !== 'YES') { return new Error('TMX is not enabled in .env file') }
    let data: string = ''
    let prefix: string = ''
    for (const p of this.prefixes) {
      const res = await fetch(`https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${mapId}`).catch((err: Error) => err)
      if (res instanceof Error) {
        ErrorHandler.error(res.message)
        continue
      }
      data = await res.text()
      if (res.ok === true && data !== '') { // They send empty page instead of error for some reason. NICE!!!!
        prefix = p
        break
      }
    }
    if (prefix === '') { return new Error('Cannot fetch map data from TMX') }
    const s: string[] = data.split('\t')
    const id: number = Number(s[0])
    const site: string = ['TMNF', 'TMU', 'TMN', 'TMO', 'TMS'][['tmnforever', 'united', 'nations', 'original', 'sunrise'].indexOf(prefix)]
    return await this.fetchMapFile(id, site)
  }

  /**
   * Fetches TMX info for map with given id
   */
  static async fetchMapInfo(mapId: string): Promise<TMXMapInfo | Error> {
    if (process.env.USE_TMX !== 'YES') { return new Error('TMX is not enabled in .env file') }
    let data: string = ''
    let prefix: string = ''
    for (const p of this.prefixes) {
      const res = await fetch(`https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${mapId}`).catch((err: Error) => err)
      if (res instanceof Error) {
        ErrorHandler.error(res.message)
        continue
      }
      data = await res.text()
      if (res.ok === true && data !== '') { // They send empty page instead of error for some reason. NICE!!!!
        prefix = p
        break
      }
    }
    if (prefix === '') {
      this._current = null
      return new Error('Cannot fetch map data from TMX')
    }
    const s: string[] = data.split('\t')
    const TMXId: number = Number(s[0])
    const replaysRes = await fetch(`https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackrecords&id=${TMXId}`).catch((err: Error) => err)
    if (replaysRes instanceof Error) {
      ErrorHandler.error(replaysRes.message)
      return replaysRes
    }
    const replaysData: string[] = (await replaysRes.text()).split('\r\n')
    replaysData.pop()
    const replays: TMXReplay[] = []
    for (const r of replaysData) {
      const rs: string[] = r.split('\t')
      replays.push({
        id: Number(rs[0]),
        userId: Number(rs[1]),
        name: rs[2],
        time: Number(rs[3]),
        recordDate: new Date(rs[4]),
        mapDate: new Date(rs[5]),
        approved: rs[6],
        leaderboardScore: Number(rs[7]),
        expires: rs[8],
        lockspan: rs[9],
        url: `https://${prefix}.tm-exchange.com/recordgbx/${rs[0]}`
      })
    }
    Object.freeze(replays)
    const obj: TMXMapInfo = {
      id: mapId,
      TMXId,
      name: s[1],
      authorId: Number(s[2]),
      author: s[3],
      uploadDate: new Date(s[4]),
      lastUpdateDate: new Date(s[5]),
      type: s[7],
      environment: s[8],
      mood: s[9],
      style: s[10],
      routes: s[11],
      length: s[12],
      difficulty: s[13],
      leaderboardRating: Number(s[14]),
      isClassic: Number(s[14]) === 0,
      isNadeo: Number(s[14]) === 50000,
      game: s[15],
      comment: s[16],
      commentsAmount: Number(s[17]),
      awards: Number(s[18].split('<BR>')[0]),
      pageUrl: `https://${prefix}.tm-exchange.com/trackshow/${TMXId}`,
      screenshotUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreen&id=${TMXId}`,
      thumbnailUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreensmall&id=${TMXId}`,
      downloadUrl: `https://${prefix}.tm-exchange.com/trackgbx/${TMXId}`,
      replays
    }
    return obj
  }
}
