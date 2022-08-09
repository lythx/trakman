// import { Logger } from "../Logger.js"
// import { MapService } from "./MapService.js"
// import { TMXService } from "./TMXService.js"
// import CONFIG from "../../config.json" assert { type: 'json' }
// import { Events } from "../Events.js"

// interface JukeboxMap {
//   readonly map: TMMap
//   readonly isForced: boolean
//   readonly callerLogin?: string
// }

// /**
//  * This service manages map queue and map history
//  */
// export abstract class JukeboxService {

//   private static readonly _queue: JukeboxMap[] = []
//   private static _current: TMMap
//   private static readonly _previous: TMMap[] = []
//   static readonly queueLength: number = CONFIG.jukeboxQueueSize
//   static readonly previousLength: number = CONFIG.jukeboxPreviousMapsInRuntime

//   /**
//    * Creates map queue and current map object, adds listener for map add, remove, and Match Setting update
//    */
//   static initialize(): void {
//     this._current = { ...MapService.current }
//     this.fillQueue()
//     void MapService.updateNextMap(this._queue[0].map.id)
//     Events.addListener('Controller.MapAdded', (info: MapAddedInfo): void => {
//       const status: void | Error = this.add(info.id, info.callerLogin, true)
//       if (status instanceof Error) {
//         Logger.error(`Failed to insert newly added map ${info.name} into the jukebox, clearing the jukebox to prevent further errors...`)
//         this.clear()
//       }
//     })
//     Events.addListener('Controller.MapRemoved', (info) => {
//       this.remove(info.id, info.callerLogin)
//     })
//     Events.addListener('Controller.MatchSettingsUpdated', () => {
//       this.clear()
//     })
//   }

//   /**
//    * 
//    */
//   static nextMap(): void {
//     this._previous.unshift(this._current)
//     this._previous.length = Math.min(this.previousLength, this._previous.length)
//     this._current = MapService.current
//     if (this._current.id === this._queue[0].map.id) {
//       this._queue.shift()
//       this.fillQueue()
//     }
//     void MapService.updateNextMap(this._queue[0].map.id)
//   }

//   private static fillQueue(): void {
//     const maps = MapService.maps
//     while (this._queue.length < this.queueLength) {
//       let currentIndex: number = maps.findIndex(a => a.id === this._current.id)
//       const lgt: number = MapService.mapCount
//       let current: TMMap
//       let i: number = 0
//       do {
//         i++
//         current = maps[(i + currentIndex) % lgt]
//       } while ([...this._queue.map(a => a.map), ...this._previous, this._current].some(a => a.id === current.id) && i < lgt)
//       if (current !== undefined) { this._queue.push({ map: current, isForced: false }) }
//       else { this._queue.push({ map: this._previous[0], isForced: false }) }
//     }
//   }


//   /**
//    * Adds a map to the queue
//    * @param mapId Map UID
//    */
//   static add(mapId: string, callerLogin?: string, setAsNextMap?: true): void | Error {
//     const map: TMMap | undefined = MapService.maps.find(a => a.id === mapId)
//     if (map === undefined) { return new Error(`Can't find map with id ${mapId} in memory`) }
//     const index: number = setAsNextMap === true ? 0 : this._queue.findIndex(a => a.isForced === false)
//     this._queue.splice(index, 0, { map: map, isForced: true, callerLogin })
//     MapService.updateNextMap(this._queue[0].map.id)
//     void TMXService.addMap(mapId, index)
//     Events.emitEvent('Controller.JukeboxChanged', this.queue)
//     if (callerLogin !== undefined) {
//       Logger.trace(`${callerLogin} has added map ${map.name} by ${map.author} to the jukebox`)
//     } else {
//       Logger.trace(`Map ${map.name} by ${map.author} has been added to the jukebox`)
//     }
//   }

//   /**
//    * Removes a map from the queue
//    * @param mapId Map UID
//    */
//   static remove(mapId: string, callerLogin?: string): boolean {
//     if (!this._queue.filter(a => a.isForced === true).some(a => a.map.id === mapId)) { return false }
//     const index: number = this._queue.findIndex(a => a.map.id === mapId)
//     if (callerLogin !== undefined) {
//       Logger.trace(`${callerLogin} has removed map ${this._queue[index].map.name} by ${this._queue[index].map.author} from the jukebox`)
//     } else {
//       Logger.trace(`Map ${this._queue[index].map.name} by ${this._queue[index].map.author} has been removed from the jukebox`)
//     }
//     this._queue.splice(index, 1)
//     this.fillQueue()
//     MapService.updateNextMap(this._queue[0].map.id)
//     void TMXService.removeMap(index)
//     Events.emitEvent('Controller.JukeboxChanged', this.queue)
//     return true
//   }

//   /**
//    * Removes all maps from jukebox
//    */
//   static clear(callerLogin?: string): void {
//     let n: number = this._queue.length
//     for (let i: number = 0; i < n; i++) {
//       if (this._queue[i].isForced) {
//         this._queue.splice(i--, 1)
//         n--
//       }
//     }
//     this.fillQueue()
//     Events.emitEvent('Controller.JukeboxChanged', this.queue)
//     if (callerLogin !== undefined) {
//       Logger.trace(`${callerLogin} has cleared the jukebox`)
//     } else {
//       Logger.trace(`The jukebox has been cleared`)
//     }
//   }

//   /**
//    * Shuffle the map list and jukebox
//    */
//   static shuffle(callerLogin?: string): void {
//     MapService.shuffle(callerLogin)
//     this._queue.length = 0
//     this.fillQueue()
//     Events.emitEvent('Controller.JukeboxChanged', this.queue)
//   }

//   static get jukebox(): ({ map: TMMap, callerLogin?: string })[] {
//     return [...this._queue.filter(a => a.isForced === true).map(a => ({ map: a.map, callerLogin: a.callerLogin }))]
//   }

//   static get queue(): TMMap[] {
//     return [...this._queue.map(a => a.map)]
//   }

//   static get previous(): TMMap[] {
//     return [...this._previous]
//   }

//   static get current(): TMMap {
//     return this._current
//   }

// }