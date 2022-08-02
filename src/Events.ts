interface EventWithCallbackInterface {
  "Controller.Ready": []
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
  "Controller.DedimaniaRecords": MapDedisInfo
  "Controller.DedimaniaRecord": DediRecordInfo
  "Controller.KarmaVote": KarmaVoteInfo
  "Controller.ManiakarmaVotes": MKVotesInfo
  "Controller.MapAdded": MapAddedInfo
  "Controller.MapRemoved": MapRemovedInfo
  "Controller.BillUpdated": BillUpdatedInfo
  "Controller.MatchSettingsUpdated": TMMap[]
  "Controller.PrivilegeChanged": PrivilegeChangedInfo
  "Controller.LocalRecords": TMRecord[]
}


const eventListeners: { event: TMEvent, callback: ((params: any) => void | Promise<void>) }[] = []
let controllerReady: boolean = false

const initialize = (): void => {
  controllerReady = true
  emitEvent('Controller.Ready', [])
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
