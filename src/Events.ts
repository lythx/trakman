'use strict'

export abstract class Events {

  private static readonly eventListeners: TMEvent[] = []
  private static controllerReady = false

  static initialize() {
    this.controllerReady = true
    Events.emitEvent('Controller.Ready', [])
  }
  /**
   * Add callback function to execute on given event
   * @param event dedicated server callback event
   * @param callback
   */
  static addListener (event: string, callback: Function): void {
    const e: TMEvent = { event: event, callback: callback }
    this.eventListeners.push(e)
  }

  /**
   * Execute the event callbacks
   * @param {String} event callback event name
   * @param {any[]} json callback params
   */
  static emitEvent (event: string, json: any): void {
    if(!this.controllerReady)
      return
    const matchingEvents = this.eventListeners.filter(a => a.event === event)
    for (const listener of matchingEvents) {
      listener.callback(json)
    }
  }
}
