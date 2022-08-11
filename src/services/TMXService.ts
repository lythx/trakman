import fetch from 'node-fetch'
import 'dotenv/config'
import CONFIG from '../../config.json' assert { type: 'json' }
import { Logger } from '../Logger.js'
import { Events } from '../Events.js'
import { MapService } from './MapService.js'

type TMXPrefix = 'tmnforever' | 'united' | 'nations' | 'original' | 'sunrise'

export abstract class TMXService {

  private static readonly _previous: (TMXMapInfo | null)[] = []
  private static _current: TMXMapInfo | null
  private static readonly _next: (TMXMapInfo | null)[] = []
  private static readonly prefixes: TMXPrefix[] = ['tmnforever', 'united', 'nations', 'original', 'sunrise']
  private static readonly sites: TMXSite[] = ['TMNF', 'TMU', 'TMN', 'TMO', 'TMS']
  private static readonly nextSize: number = CONFIG.tmxMapPrefetch
  private static readonly previousSize: number = CONFIG.tmxPreviousMapsInRuntime
  private static readonly isActive: boolean = process.env.USE_TMX === 'YES'

  static async initialize(): Promise<void> {
    if (this.isActive === false) { return }
    if (this.nextSize > MapService.queueSize) {
      await Logger.fatal(`jukeboxQueueSize (${MapService.queueSize}) can't be lower than tmxMapPrefetch (${this.nextSize}). Change your config.json file`)
    }
    const current: TMXMapInfo | Error = await this.fetchMapInfo(MapService.current.id)
    this._current = current instanceof Error ? null : current
    for (let i: number = 0; i < this.nextSize; i++) {
      const id: string = MapService.queue[i].id
      const map: TMXMapInfo | Error = await this.fetchMapInfo(id)
      this._next.push(map instanceof Error ? null : map)
    }
  }

  static async nextMap(): Promise<void> {
    if (this.isActive === false) { return }
    this._previous.unshift(this._current)
    this._previous.length = Math.min(this._previous.length, this.previousSize)
    let next: TMXMapInfo | null | undefined = this._next.shift()
    if (next === undefined) {
      await Logger.fatal(`Can't find tmx prefetch in memory while setting next map`)
      return
    }
    this._current = next
    const map: TMXMapInfo | Error = await this.fetchMapInfo(MapService.queue[this.nextSize - 1].id)
    this._next.push(map instanceof Error ? null : map)
    Events.emitEvent('Controller.TMXQueueChanged', this.next)
  }

  static async addMap(id: string, index: number): Promise<void> {
    if (this.isActive === false || index >= this.nextSize) { return }
    const map: TMXMapInfo | Error = await this.fetchMapInfo(id)
    this._next.splice(index, 0, map instanceof Error ? null : map)
    this._next.length = this.nextSize
    Events.emitEvent('Controller.TMXQueueChanged', this.next)
  }

  static async removeMap(index: number): Promise<void> {
    if (this.isActive === false || index >= this.nextSize) { return }
    this._next.splice(index, 1)
    const map: TMXMapInfo | Error = await this.fetchMapInfo(MapService.queue[this.nextSize - 1].id)
    this._next.push(map instanceof Error ? null : map)
    Events.emitEvent('Controller.TMXQueueChanged', this.next)
  }

  static get current(): TMXMapInfo | null {
    if (this.isActive === false) { return null }
    return this._current === null ? null : { ...this._current }
  }

  static get next(): (TMXMapInfo | null)[] {
    if (this.isActive === false) { return new Array(this.nextSize).fill(null) }
    return [...this._next]
  }

  static get previous(): (TMXMapInfo | null)[] {
    if (this.isActive === false) { return new Array(this.previousSize).fill(null) }
    return [...this._previous]
  }

  /**
   * Fetches the map from TMX via its UID
   * @param mapId Map UID
   * @returns TMX map data or error if unsuccessful
   */
  static async fetchMapFile(mapId: string): Promise<{ name: string, content: Buffer } | Error>
  /**
   * Fetches map gbx file from tmx by TMX id, returns name and file in base64 string
   */
  static async fetchMapFile(tmxId: number, site?: TMXSite): Promise<{ name: string, content: Buffer } | Error>
  static async fetchMapFile(id: number | string, site: TMXSite = 'TMNF'): Promise<{ name: string, content: Buffer } | Error> {
    let prefix: TMXPrefix = this.siteToPrefix(site)
    if (typeof id === 'string') {
      const res = await this.getTMXId(id)
      if (res instanceof Error) {
        return res
      }
      id = res.id
      prefix = res.prefix
    }
    const url: string = `https://${prefix}.tm-exchange.com/trackgbx/${id}`
    const res = await fetch(url).catch((err: Error) => err)
    if (res instanceof Error) {
      Logger.error(`Error while fetching map file from TMX (url: ${url})`, res.message)
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
   * Fetches the map from TMX via its UID
   * @param mapId Map UID
   * @returns TMX map data or error if unsuccessful
   */
  private static async getTMXId(mapId: string): Promise<{ id: number, prefix: TMXPrefix } | Error> {
    let data: string = ''
    let prefix: TMXPrefix | undefined
    for (const p of this.prefixes) {
      const url: string = `https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${mapId}`
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error) {
        Logger.error(`Error while fetching map info by uuid from TMX (url: ${url})`, res.message)
        continue
      }
      data = await res.text()
      if (res.ok === true && data !== '') { // They send empty page instead of error for some reason. NICE!!!!
        prefix = p
        break
      }
    }
    if (prefix === undefined) { return new Error('Cannot fetch map data from TMX') }
    const s: string[] = data.split('\t')
    const id: number = Number(s[0])
    return { id, prefix }
  }

  /**
   * Fetches TMX for map information
   * @param mapId Map UID
   * @returns Map info from TMX or error if unsuccessful
   */
  static async fetchMapInfo(mapId: string): Promise<TMXMapInfo | Error> {
    let data: string = ''
    let prefix: TMXPrefix | undefined
    for (const p of this.prefixes) { // Search for right prefix
      const url: string = `https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${mapId}`
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error) {
        Logger.error(`Error while fetching map info from TMX (url: ${url})`, res.message)
        continue
      }
      data = await res.text()
      if (res.ok === true && data !== '') { // They send empty page instead of error for some reason. NICE!!!!
        prefix = p
        break
      }
    }
    if (prefix === undefined) {
      return new Error('Cannot fetch map data from TMX')
    }
    const s: string[] = data.split('\t')
    const TMXId: number = Number(s[0])
    const url: string = `https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackrecords&id=${TMXId}`
    const replaysRes = await fetch(url).catch((err: Error) => err)
    if (replaysRes instanceof Error) {
      Logger.error(`Error while fetching replays info from TMX (url: ${url})`, replaysRes.message)
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
    const mapInfo: TMXMapInfo = {
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
    if (!Number.isInteger(mapInfo.awards) || !Number.isInteger(mapInfo.leaderboardRating)) {
      Logger.debug(JSON.stringify(mapInfo, null, 2))
    } else {
      void MapService.setAwardsAndLbRating(mapId, mapInfo.awards, mapInfo.leaderboardRating)
    }
    return mapInfo
  }

  private static siteToPrefix(game: TMXSite): TMXPrefix {
    return this.prefixes[this.sites.indexOf(game)]
  }

}
