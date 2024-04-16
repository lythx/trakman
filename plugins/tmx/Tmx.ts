import config from './Config.js'
import type { TMXMapChangedInfo } from './TmxTypes.js'
import './ui/TMXWindow.component.js'

// fill with empty strings at start to avoid undefined error on startup
const history: (tm.TMXMap | string)[] = []
let current: tm.TMXMap | string = ''
const queueSize: number = config.queueCount
const historySize: number = config.historyCount
let queue: (tm.TMXMap | string)[] = new Array(queueSize).fill('')

const queueListeners: ((queue: (tm.TMXMap | null)[]) => void)[] = []
const mapListeners: ((info: TMXMapChangedInfo) => void)[] = []

const emitQueueChangeEvent = () => {
  for (const e of queueListeners) { e(queue.map(a => typeof a === 'string' ? null : a)) }
}

const emitMapChangeEvent = () => {
  for (const e of mapListeners) {
    e({
      history: history.map(a => typeof a === 'string' ? null : a),
      current: typeof current === 'string' ? null : current,
      queue: queue.map(a => typeof a === 'string' ? null : a)
    })
  }
}

const getUid = (map: tm.TMXMap | string): string => typeof map === 'string' ? map : map.id

const initialize = async (): Promise<void> => {
  if (queueSize > tm.jukebox.queueCount) {
    await tm.log.fatal(`jukeboxQueueSize (${tm.jukebox.queueCount}) can't be lower than tmx queueSize (${queueSize}). Change your tmx config`)
  }
  const res: tm.TMXMap | Error = await tm.tmx.fetchMapInfo(tm.maps.current.id)
  current = res instanceof Error ? tm.maps.current.id : res
  const q = tm.jukebox.queue.slice(0, queueSize)
  for (const [i, e] of q.entries()) {
    const map: tm.TMXMap | Error = await tm.tmx.fetchMapInfo(e.id)
    queue[i] = map instanceof Error ? e.id : map
  }
  emitMapChangeEvent()
  emitQueueChangeEvent()
  tm.log.trace('TMX plugin instantiated')
}

const nextMap = async (): Promise<void> => {
  history.unshift(current)
  history.length = Math.min(history.length, historySize)
  update(true)
}

const update = async (updateCurrent?: true): Promise<void> => {
  const fetchedMaps = [...queue, current, ...history]
  const newQueueUids = tm.jukebox.queue.slice(0, queueSize).map(a => a.id)
  const curId = tm.maps.current.id
  if (updateCurrent) {
    const entry = fetchedMaps.find(a => getUid(a) === curId)
    if (entry !== undefined) { current = entry }
    else {
      const res = await tm.tmx.fetchMapInfo(curId)
      current = res instanceof Error ? curId : res
    }
    emitMapChangeEvent()
  }
  const newQueue: typeof queue = []
  for (const e of newQueueUids) {
    const entry = fetchedMaps.find(a => getUid(a) === e)
    if (entry !== undefined) {
      newQueue.push(entry)
    } else {
      const res = await tm.tmx.fetchMapInfo(e)
      newQueue.push(res instanceof Error ? e : res)
    }
  }
  queue = newQueue
  emitQueueChangeEvent()
}

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    tm.log.trace('Initializing TMX...')
    void initialize()
  })
  tm.addListener('JukeboxChanged', () => void update())
  tm.addListener('BeginMap', info => {
    if (!info.isRestart) { void nextMap() }
  })
}

/**
 * Gets tmx info for a map from the history
 * @param uid Map uid
 * @returns tmx object if map is in the history and on tmx, otherwise undefined
 */
function getFromHistory(uid: string): Readonly<tm.TMXMap> | undefined
/**
 * Gets tmx info for multiple maps from the history
 * @param uids Array of map uids
 * @returns Array of tmx objects
 */
function getFromHistory(uids: string[]): Readonly<tm.TMXMap>[]
function getFromHistory(uids: string | string[]): Readonly<tm.TMXMap> | undefined | Readonly<tm.TMXMap>[] {
  if (typeof uids === 'string') {
    return history.find(a => !(typeof a === 'string') && a.id === uids) as any
  }
  return history.filter(a => !(typeof a === 'string') && uids.includes(a.id)) as any
}

/**
 * Gets TMX info for a map from the queue
 * @param uid Map uid
 * @returns TMX object if map is in the queue and on TMX, otherwise undefined
 */
function getFromQueue(uid: string): Readonly<tm.TMXMap> | undefined
/**
 * Gets TMX info for multiple maps from the queue
 * @param uids Array of map uids
 * @returns Array of TMX objects
 */
function getFromQueue(uids: string[]): Readonly<tm.TMXMap>[]
function getFromQueue(uids: string | string[]): Readonly<tm.TMXMap> | undefined | Readonly<tm.TMXMap>[] {
  if (typeof uids === 'string') {
    return queue.find(a => !(typeof a === 'string') && a.id === uids) as any
  }
  return queue.filter(a => !(typeof a === 'string') && uids.includes(a.id)) as any
}

/**
 * Fetches TMX data for current map and maps in the queue. 
 * Provides utilities for accessing TMX related data.
 * @author lythx
 * @since 0.1
 */
export const tmx = {

  /**
   * Adds a callback function to execute on TMX map queue change
   * @param callback Function to execute on event. It takes new map queue as a parameter
   */
  onQueueChange(callback: ((queue: (tm.TMXMap | null)[]) => void)) {
    queueListeners.push(callback)
  },

  /**
   * Adds a callback function to execute on TMX current map change
   * @param callback Function to execute on event. It takes new current map as a parameter
   */
  onMapChange(callback: ((info: TMXMapChangedInfo) => void)) {
    mapListeners.push(callback)
  },

  getFromHistory,

  getFromQueue,

  /**
   * Current map TMX info or null if map is not on tmx 
   */
  get current(): Readonly<tm.TMXMap> | null {
    return typeof current === 'string' ? null : current
  },

  /**
   * TMX info for map history
   */
  get history(): (Readonly<tm.TMXMap> | null)[] {
    return history.map(a => typeof a === 'string' ? null : a)
  },

  /**
   * Number of maps in TMX map history
   */
  get historyCount(): number {
    return history.length
  },

  /**
   * TMX info for map queue
   */
  get queue(): (Readonly<tm.TMXMap> | null)[] {
    return queue.map(a => typeof a === 'string' ? null : a)
  },

  /**
   * Number of maps in TMX map queue
   */
  get queueCount(): number {
    return queue.length
  },

  /**
   * TMX map history size limit
   */
  get maxHistoryCount(): number {
    return config.historyCount
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled

}

export type { TMXMapChangedInfo }
