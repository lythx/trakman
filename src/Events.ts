import { Client } from "./client/Client.js"
import { Logger } from "./Logger.js"
import { GameService } from './services/GameService.js'

const eventListeners: { event: keyof tm.Events, callback: ((params: any) => void | Promise<void>) }[] = []
let controllerReady: boolean = false

const initialize = async (): Promise<void> => {
  const res = await Client.call('GetStatus')
  if (res instanceof Error) {
    await Logger.fatal('Failed to get server status', res.message, res.stack)
    return
  }
  let status: 'result' | 'race'
  if (res.Code === 5) {
    status = 'result'
  } else if (res.Code === 4) {
    status = 'race'
  } else {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    initialize()
    return
  }
  GameService.state = status
  controllerReady = true
  emit('Startup', status)
}

/**
 * Add callback function to execute on given event.
 * @param event Dedicated server callback event
 * @param callback Function to execute on event
 * @param prepend If set to true puts the listener on the beggining of the array (it will get executed before other listeners)
 */
const addListener = <T extends keyof tm.Events>(event: T | (keyof tm.Events)[],
  callback: ((params: T extends keyof tm.Events ? tm.Events[T] : any)
    => void | Promise<void>), prepend?: true): void => {
  const arr: { event: keyof tm.Events, callback: ((params: any) => void) }[] = []
  if (Array.isArray(event)) {
    arr.push(...event.map(a => ({ event: a, callback })))
  } else {
    arr.push({ event: event, callback: callback })
  }
  prepend === true ? eventListeners.unshift(...arr) : eventListeners.push(...arr)
}

/**
 * Removes event listener.
 * @param callback Callback function of the listener to remove
 */
const removeListener = (callback: Function): void => {
  let index: number = eventListeners.findIndex(a => a.callback === callback)
  while (index !== -1) {
    eventListeners.splice(index, 1)
    index = eventListeners.findIndex(a => a.callback === callback)
  }
}

/**
 * Execute the event callbacks
 * @param event callback event name
 * @param params callback params
 */
const emit = <T extends keyof tm.Events>(event: T,
  params: tm.Events[T]): void => {
  if (!controllerReady) { return }
  const matchingEvents = eventListeners.filter(a => a.event === event || a.event === '*')
  for (const listener of matchingEvents) {
    if (listener.event === '*') {
      listener.callback({ event, params })
    } else {
      listener.callback(params)
    }
  }
}

export const Events = { initialize, addListener, removeListener, emit }
