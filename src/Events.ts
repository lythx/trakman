import { Client } from "./client/Client.js"
import { Logger } from "./Logger.js"
import { GameService } from './services/GameService.js'

const eventListeners: { event: keyof TM.Events, callback: ((params: any) => void | Promise<void>) }[] = []
let controllerReady: boolean = false

const initialize = async () => {
  const res = await Client.call('GetStatus')
  if (res instanceof Error) {
    await Logger.fatal('Failed to get server status', res.message, res.stack)
    return
  }
  let status: 'result' | 'race'
  if (res[0].Code === 5) {
    status = 'result'
  } else if (res[0].Code === 4) {
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
 * Add callback function to execute on given event
 * @param event dedicated server callback event
 * @param callback function to execute on event
 * @param prepend if set to true puts the listener on the beggining of the array (it will get executed before other listeners)
 */
const addListener = <T extends keyof TM.Events>(event: T | (keyof TM.Events)[],
  callback: ((params: T extends keyof TM.Events ? TM.Events[T] : any)
    => void | Promise<void>), prepend?: true): void => {
  const arr: { event: keyof TM.Events, callback: ((params: any) => void) }[] = []
  if (Array.isArray(event)) {
    arr.push(...event.map(a => ({ event: a, callback })))
  } else {
    arr.push({ event: event, callback: callback })
  }
  prepend === true ? eventListeners.unshift(...arr) : eventListeners.push(...arr)
}

/**
 * Execute the event callbacks
 * @param event callback event name
 * @param params callback params
 */
const emit = async <T extends keyof TM.Events>(event: T,
  params: TM.Events[T]): Promise<void> => {
  if (controllerReady === false) { return }
  const matchingEvents = eventListeners.filter(a => a.event === event)
  for (const listener of matchingEvents) {
    await listener.callback(params) // TODO make not await if poss
  }
}

export const Events = { initialize, addListener, emit }
