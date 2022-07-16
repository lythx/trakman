import { MapService } from "./MapService.js"
import { TMXService } from "./TMXService.js"

interface JukeboxMap {
  readonly map: TMMap
  readonly isForced: boolean
}

export abstract class JukeboxService {

  private static readonly _queue: JukeboxMap[] = []
  private static _current: TMMap
  private static readonly _previous: TMMap[] = []

  static initialize(): void {
    this._current = { ...MapService.current }
    const currentIndex: number = MapService.maps.findIndex(a => a.id === this._current.id)
    const lgt: number = MapService.maps.length
    for (let i: number = 1; i <= 30; i++) {
      this._queue.push({ map: MapService.maps[(i + currentIndex) % lgt], isForced: false })
    }
    MapService.setNextMap(this._queue[0].map.id)
  }

  static nextMap(): void {
    this._previous.unshift(this._current)
    this._previous.length = Math.min(30, this._previous.length)
    this._current = MapService.current
    if (this._current.id === this._queue[0].map.id) {
      this._queue.shift()
      this.fillQueue()
    }
    MapService.setNextMap(this._queue[0].map.id)
  }

  private static fillQueue(): void {
    while (this._queue.length < 30) {
      let currentIndex: number = MapService.maps.findIndex(a => a.id === this._current.id)
      const lgt: number = MapService.maps.length
      let current: TMMap
      let i: number = 0
      do {
        i++
        current = MapService.maps[(i + currentIndex) % lgt]
      } while ([...this._queue.map(a => a.map), ...this._previous, this._current].some(a => a.id === current.id) && i < lgt)
      if (current !== undefined) { this._queue.push({ map: current, isForced: false }) }
      else { this._queue.push({ map: this._previous[0], isForced: false }) }
    }
  }

  static add(mapId: string): void | Error {
    const map: TMMap | undefined = MapService.maps.find(a => a.id === mapId)
    if (map === undefined) { return new Error(`Can't find map with id ${mapId} in`) }
    const index: number = this._queue.findIndex(a => a.isForced === false)
    this._queue.splice(index, 0, { map: map, isForced: true })
    MapService.setNextMap(this._queue[0].map.id)
    TMXService.add(mapId, index)
  }

  static remove(mapId: string): boolean {
    if (!this._queue.filter(a => a.isForced === true).some(a => a.map.id === mapId)) { return false }
    const index: number = this._queue.findIndex(a => a.map.id === mapId)
    this._queue.splice(index, 1)
    const q: TMMap | undefined = MapService.maps.find(a => !this._queue.some(b => b.map.id === a.id))
    if (q !== undefined) { this._queue.push({ map: q, isForced: false }) }
    else { this._queue.push({ map: this._previous[0], isForced: false }) }
    MapService.setNextMap(this._queue[0].map.id)
    TMXService.remove(index)
    return true
  }

  static clear(): void {
    let n = this._queue.length
    for (let i = 0; i < n; i++) {
      if (this._queue[i].isForced) {
        this._queue.splice(i--, 1)
        n--
      }
    }
    this.fillQueue()
  }

  static shuffle(adminLogin: string): void {
    MapService.shuffle(adminLogin)
    this._queue.length = 0
    this.fillQueue()
  }

  static get jukebox(): TMMap[] {
    return [...this._queue.filter(a => a.isForced === true).map(a => a.map)]
  }

  static get queue(): TMMap[] {
    return [...this._queue.map(a => a.map)]
  }

  static get previous(): TMMap[] {
    return [...this._previous]
  }

  static get current(): TMMap {
    return {...this._current}
  }

}