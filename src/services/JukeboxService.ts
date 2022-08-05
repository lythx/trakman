import { Logger } from "../Logger.js"
import { MapService } from "./MapService.js"
import { TMXService } from "./TMXService.js"
import CONFIG from "../../config.json" assert { type: 'json' }
import { Events } from "../Events.js"

interface JukeboxMap {
  readonly map: TMMap
  readonly isForced: boolean
  readonly callerLogin?: string
}

/**
 * This service is related to MapService and TMXService
 */
export abstract class JukeboxService {

  private static readonly _queue: JukeboxMap[] = []
  private static _current: TMMap
  private static readonly _previous: TMMap[] = []
  static readonly queueLength: number = CONFIG.jukeboxQueueSize
  static readonly previousLength: number = CONFIG.jukeboxPreviousMapsInRuntime

  static initialize(): void {
    this._current = { ...MapService.current }
    const currentIndex: number = MapService.maps.findIndex(a => a.id === this._current.id)
    const lgt: number = MapService.maps.length
    for (let i: number = 1; i <= this.queueLength; i++) { // Handles less maps than jukebox length exception
      this._queue.push({ map: MapService.maps[(i + currentIndex) % lgt], isForced: false })
    }
    MapService.setNextMap(this._queue[0].map.id)
    Events.addListener('Controller.MapAdded', (info: MapAddedInfo): void => {
      const status: void | Error = this.add(info.id, info.callerLogin, true)
      if (status instanceof Error) {
        Logger.error(`Failed to insert newly added map ${info.name} into the jukebox, clearing the jukebox to prevent further errors...`)
        this.clear()
      }
    })
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
    while (this._queue.length < this.queueLength) {
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

  static add(mapId: string, callerLogin?: string, setAsNextMap?: true): void | Error {
    const map: TMMap | undefined = MapService.maps.find(a => a.id === mapId)
    if (map === undefined) { return new Error(`Can't find map with id ${mapId} in memory`) }
    const index: number = setAsNextMap === true ? 0 : this._queue.findIndex(a => a.isForced === false)
    this._queue.splice(index, 0, { map: map, isForced: true, callerLogin })
    MapService.setNextMap(this._queue[0].map.id)
    void TMXService.addMap(mapId, index)
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    if (callerLogin !== undefined) {
      Logger.trace(`${callerLogin} has added map ${map.name} by ${map.author} to the jukebox`)
    } else {
      Logger.trace(`Map ${map.name} by ${map.author} has been added to the jukebox`)
    }
  }

  static remove(mapId: string, callerLogin?: string): boolean {
    if (!this._queue.filter(a => a.isForced === true).some(a => a.map.id === mapId)) { return false }
    const index: number = this._queue.findIndex(a => a.map.id === mapId)
    if (callerLogin !== undefined) {
      Logger.trace(`${callerLogin} has removed map ${this._queue[index].map.name} by ${this._queue[index].map.author} from the jukebox`)
    } else {
      Logger.trace(`Map ${this._queue[index].map.name} by ${this._queue[index].map.author} has been removed from the jukebox`)
    }
    this._queue.splice(index, 1)
    this.fillQueue()
    MapService.setNextMap(this._queue[0].map.id)
    void TMXService.removeMap(index)
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    return true
  }

  static clear(callerLogin?: string): void {
    let n: number = this._queue.length
    for (let i: number = 0; i < n; i++) {
      if (this._queue[i].isForced) {
        this._queue.splice(i--, 1)
        n--
      }
    }
    this.fillQueue()
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    if (callerLogin !== undefined) {
      Logger.trace(`${callerLogin} has cleared the jukebox`)
    } else {
      Logger.trace(`The jukebox has been cleared`)
    }
  }

  static shuffle(callerLogin?: string): void {
    MapService.shuffle(callerLogin)
    this._queue.length = 0
    this.fillQueue()
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
  }

  static get jukebox(): ({ map: TMMap, callerLogin?: string })[] {
    return [...this._queue.filter(a => a.isForced === true).map(a => ({ map: a.map, callerLogin: a.callerLogin }))]
  }

  static get queue(): TMMap[] {
    return [...this._queue.map(a => a.map)]
  }

  static get previous(): TMMap[] {
    return [...this._previous]
  }

  static get current(): TMMap {
    return this._current
  }

}