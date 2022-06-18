import fetch from 'node-fetch'
import { ErrorHandler } from '../ErrorHandler.js'
import { JukeboxService } from './JukeboxService.js'

export abstract class TMXService {

  private static readonly _previous: (TMXTrackInfo | null)[] = []
  private static _current: TMXTrackInfo | null
  private static readonly _next: (TMXTrackInfo | null)[] = []
  private static readonly prefixes = ['tmnforever', 'united', 'nations', 'original', 'sunrise']
  private static readonly nextSize = 4
  private static readonly previousSize = 4

  static async initialize(): Promise<void | Error> {
    const status = await this.fetchTrackInfo('zwAbNlFSDcXjRBk0YSMyxc5kJJ8') // Fetching A12 to test if TMX is working
    if (status instanceof Error) { return status }
    const current = await this.fetchTrackInfo(JukeboxService.current.id)
    this._current = current instanceof Error ? null : current
    for (let i = 0; i < Math.min(JukeboxService.queue.length, this.nextSize); i++) {
      const id = JukeboxService.queue[i].id
      const track = await this.fetchTrackInfo(id)
      this._next.push(track instanceof Error ? null : track)
    }
  }

  static async nextChallenge(): Promise<void | Error> {
    this._previous.unshift(this._current)
    this._previous.length = Math.min(this._previous.length, this.previousSize)
    const next = this._next.shift()
    if (next === undefined) {
      ErrorHandler.error(`TMX didn't get prefetched for some reason, this should never happen`)
      return
    }
    this._current = next
    const track = await this.fetchTrackInfo(JukeboxService.queue[this.nextSize - 1].id)
    this._next.push(track instanceof Error ? null : track)
  }

  static restartChallenge(): void {
    this._previous.unshift(this._current === null ? null : { ...this._current })
    this._previous.length = Math.min(this._previous.length, this.previousSize)
  }

  static async add(id: string, index: number): Promise<void | Error> {
    if (index >= this.nextSize) { return }
    const track = await this.fetchTrackInfo(id)
    this._next.splice(index, 0, track instanceof Error ? null : track)
    this._next.length = this.nextSize
  }

  static async remove(index: number) {
    if (index >= this.nextSize) { return }
    this._next.splice(index, 1)
    const track = await this.fetchTrackInfo(JukeboxService.queue[this.nextSize - 1].id)
    this._next.push(track instanceof Error ? null : track)
  }

  static get current(): TMXTrackInfo | null {
    return this._current === null ? null : { ...this._current }
  }

  static get next(): (TMXTrackInfo | null)[] {
    return [...this._next]
  }

  static get previous(): (TMXTrackInfo | null)[] {
    return [...this._previous]
  }

  /**
   * Fetches track gbx file from tmx by track id, returns name and file in base64 string
   */
  static async fetchTrackFile(id: number, game: string = 'TMNF'): Promise<TMXFileData | Error> {
    const prefix = this.prefixes[['TMNF', 'TMU', 'TMN', 'TMO', 'TMS'].indexOf(game)]
    const res = await fetch(`https://${prefix}.tm-exchange.com/trackgbx/${id}`).catch((err: Error) => err)
    if (res instanceof Error) {
      ErrorHandler.error(res.message)
      return res
    }
    const nameHeader = res.headers.get('content-disposition')
    if (nameHeader === null) { return new Error('Cannot read track name') }
    // The header is inconsistent for some reason, I hate TMX
    const name = nameHeader[21] === '"' ? nameHeader.substring(22).split('"; filename*=')[0] : nameHeader.substring(21).split('; filename*=')[0]
    const data = await res.arrayBuffer()
    const buffer = Buffer.from(data)
    return { name, content: buffer.toString('base64') }
  }

  /**
   * Fetches track gbx file from tmx by uid, returns name and file in base64 string
   */
  static async fetchTrackFileByUid(trackId: string): Promise<TMXFileData | Error> {
    let data = ''
    let prefix = ''
    for (const p of this.prefixes) {
      const res = await fetch(`https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${trackId}`).catch((err: Error) => err)
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
    if (prefix === '') { return new Error('Cannot fetch track data from TMX') }
    const s = data.split('\t')
    const id = Number(s[0])
    const site = ['TMNF', 'TMU', 'TMN', 'TMO', 'TMS'][['tmnforever', 'united', 'nations', 'original', 'sunrise'].indexOf(prefix)]
    return await this.fetchTrackFile(id, site)
  }

  /**
   * Fetches TMX info for track with given id
   */
  static async fetchTrackInfo(trackId: string): Promise<TMXTrackInfo | Error> {
    let data = ''
    let prefix = ''
    for (const p of this.prefixes) {
      const res = await fetch(`https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${trackId}`).catch((err: Error) => err)
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
      return new Error('Cannot fetch track data from TMX')
    }
    const s = data.split('\t')
    const TMXId = Number(s[0])
    const replaysRes = await fetch(`https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackrecords&id=${TMXId}`)
    const replaysData = (await replaysRes.text()).split('\r\n')
    replaysData.pop()
    const replays: TMXReplay[] = []
    for (const r of replaysData) {
      const rs = r.split('\t')
      replays.push({
        id: Number(rs[0]),
        userId: Number(rs[1]),
        name: rs[2],
        time: Number(rs[3]),
        recordDate: new Date(rs[4]),
        trackDate: new Date(rs[5]),
        approved: rs[6],
        leaderboardScore: Number(rs[7]),
        expires: rs[8],
        lockspan: rs[9],
        url: `https://${prefix}.tm-exchange.com/recordgbx/${rs[0]}`
      })
    }
    Object.freeze(replays)
    const obj: TMXTrackInfo = {
      id: trackId,
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
