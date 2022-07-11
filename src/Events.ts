type StringAutocomplete<T extends string> = T | Omit<string, T>

type TMEvent = StringAutocomplete<
"Controller.Ready" | 
"Controller.PlayerChat" | 
"Controller.PlayerJoin" | 
"Controller.PlayerLeave" | 
"Controller.PlayerRecord" |
"Controller.PlayerFinish" | 
"Controller.PlayerInfoChanged" | 
"Controller.ManialinkClick" | 
"Controller.PlayerCheckpoint" | 
"Controller.BeginChallenge" | 
"Controller.EndChallenge" | 
"Controller.DedimaniaRecords">

type EventParams = 
MessageInfo | 
JoinInfo | 
LeaveInfo | 
RecordInfo | 
FinishInfo | 
InfoChangedInfo | 
ManialinkClickInfo | 
CheckpointInfo |
BeginMapInfo |
EndMapInfo |
DediRecordInfo |
BillUpdatedInfo |
MapDedisInfo | 
any[]

export abstract class Events {
  private static readonly eventListeners: { event: TMEvent, callback: ((params: any)=> void)}[] = []
  private static controllerReady: boolean = false

  static initialize(): void {
    this.controllerReady = true
    Events.emitEvent('Controller.Ready', [])
  }

  /**
   * Add callback function to execute on given event
   * @param event dedicated server callback event
   * @param callback
   */
  static addListener(event: TMEvent, callback: ((params: any)=> void)): void {
    const e: { event: TMEvent, callback: ((params: any)=> void)} = { event: event, callback: callback }
    this.eventListeners.push(e)
  }

  /**
   * Execute the event callbacks
   * @param event callback event name
   * @param params callback params
   */
  static emitEvent(event: TMEvent, params: EventParams): void {
    if (!this.controllerReady) { return }
    const matchingEvents: { event: TMEvent, callback: ((params: any)=> void)}[] = this.eventListeners.filter(a => a.event === event)
    for (const listener of matchingEvents) {
      listener.callback(params)
    }
  }
}

