import config from './Config.js'
import { trakman as tm } from '../../src/Trakman.js'

// fill with empty strings at start to avoid undefined error on startup
const history: (TMXMapInfo | string)[] = []
let current: TMXMapInfo | string = ''
const queueSize: number = config.queueSize
const historySize: number = config.historyCount
const queue: (TMXMapInfo | string)[] = new Array(queueSize).fill('')

interface TMXMapChangedInfo {
  history: (TMXMapInfo | null)[]
  current: TMXMapInfo | null
  queue: (TMXMapInfo | null)[]
}

const queueListeners: ((queue: (TMXMapInfo | null)[]) => void)[] = []
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

const initialize = async (): Promise<void> => {
  if (queueSize > tm.jukebox.queueCount) { // TODO change message after config changes
    await tm.log.fatal(`jukeboxQueueSize (${tm.jukebox.queueCount}) can't be lower than tmx queueSize (${queueSize}). Change your tmx config`)
  }
  const res: TMXMapInfo | Error = await tm.tmx.fetchMapInfo(tm.maps.current.id)
  current = res instanceof Error ? tm.maps.current.id : res
  const q = tm.jukebox.queue.slice(0, queueSize)
  for (const [i, e] of q.entries()) {
    const map: TMXMapInfo | Error = await tm.tmx.fetchMapInfo(e.id)
    queue[i] = map instanceof Error ? e.id : map
  }
  emitMapChangeEvent()
}

const updateQueue = async (jukeboxQueue: TMMap[]): Promise<void> => {
  const jb = jukeboxQueue.slice(0, queueSize).map(a => a.id)
  for (const [i, e] of jb.entries()) {
    const entry = queue.find(a => {
      if (typeof a === 'string') { a === e }
      else { a.id === e }
    })
    if (entry !== undefined) {
      queue[i] === entry
    } else {
      const res = await tm.tmx.fetchMapInfo(e)
      queue[i] = res instanceof Error ? e : res
    }
  }
  emitQueueChangeEvent()
}

const nextMap = async (): Promise<void> => {
  history.unshift(current)
  history.length = Math.min(history.length, historySize)
  let next: TMXMapInfo | string | undefined = queue.shift()
  if (next === undefined) {
    await tm.log.fatal(`Can't find tmx prefetch in memory while setting next map`)
    return
  }
  current = next
  const id = tm.jukebox.queue[queueSize - 1].id
  const map: TMXMapInfo | Error = await tm.tmx.fetchMapInfo(id)
  queue.push(map instanceof Error ? id : map)
  emitMapChangeEvent()
}

if (config.isEnabled === true) {
  tm.addListener('Controller.Ready', () => void initialize(), true)
  tm.addListener('Controller.BeginMap', (info) => {
    if (info.isRestart === false) { void nextMap() }
  }, true)
  tm.addListener('Controller.JukeboxChanged', (queue) => void updateQueue(queue))
}

/**
 * Gets tmx info for a map from the history
 * @param uid Map uid
 * @returns tmx object if map is in the history and on tmx, otherwise undefined
 */
function getFromHistory(uid: string): Readonly<TMXMapInfo> | undefined
/**
 * Gets tmx info for multiple maps from the history
 * @param uids Array of map uids
 * @returns Array of tmx objects
 */
function getFromHistory(uids: string[]): Readonly<TMXMapInfo>[]
function getFromHistory(uids: string | string[]): Readonly<TMXMapInfo> | undefined | Readonly<TMXMapInfo>[] {
  if (typeof uids === 'string') {
    return history.find(a => !(typeof a === 'string') && a.id === uids) as any
  }
  return history.filter(a => !(typeof a === 'string') && uids.includes(a.id)) as any
}

/**
 * Gets tmx info for a map from the queue
 * @param uid Map uid
 * @returns tmx object if map is in the queue and on tmx, otherwise undefined
 */
function getFromQueue(uid: string): Readonly<TMXMapInfo> | undefined
/**
 * Gets tmx info for multiple maps from the queue
 * @param uids Array of map uids
 * @returns Array of tmx objects
 */
function getFromQueue(uids: string[]): Readonly<TMXMapInfo>[]
function getFromQueue(uids: string | string[]): Readonly<TMXMapInfo> | undefined | Readonly<TMXMapInfo>[] {
  if (typeof uids === 'string') {
    return queue.find(a => !(typeof a === 'string') && a.id === uids) as any
  }
  return queue.filter(a => !(typeof a === 'string') && uids.includes(a.id)) as any
}

export const tmx = {

  onQueueChange(callback: ((queue: (TMXMapInfo | null)[]) => void)) {
    queueListeners.push(callback)
  },

  onMapChange(callback: ((info: TMXMapChangedInfo) => void)) {
    mapListeners.push(callback)
  },

  getFromHistory,

  getFromQueue,

  get current(): Readonly<TMXMapInfo> | null {
    return typeof current === 'string' ? null : current
  },

  get history(): (Readonly<TMXMapInfo> | null)[] {
    return history.map(a => typeof a === 'string' ? null : a)
  },

  get historyCount(): number {
    return history.length
  },

  get queue(): (Readonly<TMXMapInfo> | null)[] {
    return queue.map(a => typeof a === 'string' ? null : a)
  },

  get queueCount(): number {
    return queue.length
  },

  get maxHistoryCount(): number {
    return config.historyCount
  },

  get isEnabled(): boolean {
    return config.isEnabled
  }

}
