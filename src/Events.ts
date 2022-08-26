import { Client } from "./client/Client.js"
import { Logger } from "./Logger.js"
import { GameService } from './services/GameService.js'

interface EventWithCallbackInterface {
  "Controller.Ready": 'result' | 'race'
  "Controller.PlayerChat": MessageInfo
  "Controller.PlayerJoin": JoinInfo
  "Controller.PlayerLeave": LeaveInfo
  "Controller.PlayerRecord": RecordInfo
  "Controller.PlayerFinish": FinishInfo
  "Controller.LiveRecord": FinishInfo
  "Controller.PlayerInfoChanged": InfoChangedInfo
  "Controller.ManialinkClick": ManialinkClickInfo
  "Controller.PlayerCheckpoint": CheckpointInfo
  "Controller.BeginMap": BeginMapInfo
  "Controller.EndMap": EndMapInfo
  "Controller.KarmaVote": KarmaVoteInfo
  "Controller.MapAdded": MapAddedInfo
  "Controller.MapRemoved": MapRemovedInfo
  "Controller.BillUpdated": BillUpdatedInfo
  "Controller.MatchSettingsUpdated": TMMap[]
  "Controller.PrivilegeChanged": PrivilegeChangedInfo
  "Controller.LocalRecords": TMRecord[]
  "Controller.JukeboxChanged": TMMap[]
  "Controller.RanksAndAveragesUpdated": Readonly<{ login: string, average: number }>[]
}


const eventListeners: { event: TMEvent, callback: ((params: any) => void | Promise<void>) }[] = []
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
  emitEvent('Controller.Ready', status)
}

/**
 * Add callback function to execute on given event
 * @param event dedicated server callback event
 * @param callback function to execute on event
 * @param prepend if set to true puts the listener on the beggining of the array (it will get executed before other listeners)
 */
const addListener = <T extends keyof EventWithCallbackInterface | TMEvent>(event: T | TMEvent[],
  callback: ((params: T extends keyof EventWithCallbackInterface ? EventWithCallbackInterface[T] : any) => void | Promise<void>), prepend?: true): void => {
  const arr: { event: TMEvent, callback: ((params: any) => void) }[] = []
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
const emitEvent = async <T extends keyof EventWithCallbackInterface | TMEvent>(event: T,
  params: T extends keyof EventWithCallbackInterface ? EventWithCallbackInterface[T] : EventParams): Promise<void> => {
  if (controllerReady === false) { return }
  const matchingEvents: {
    event: TMEvent,
    callback: ((params: T extends keyof EventWithCallbackInterface ? EventWithCallbackInterface[T] : EventParams) => void | Promise<void>)
  }[] = eventListeners.filter(a => a.event === event)
  for (const listener of matchingEvents) {
    await listener.callback(params)
  }
}

export const Events = { initialize, addListener, emitEvent }
