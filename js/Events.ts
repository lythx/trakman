'use strict'

export abstract class Events {
  private static eventListeners: TMEvent[] = []

  /**
   * Add callback function to execute on given event
   * @param event dedicated server callback event
   * @param callback
   */
  static addListener (event: string, callback: Function) {
    const e: TMEvent = {event: event, callback: callback}
    this.eventListeners.push(e)
  }

  /**
   * Execute the event callbacks
   * @param {String} event callback event name
   * @param {any[]} json callback params
   */
  static emitEvent (event: string, json: any[]) {
    const matchingEvents = this.eventListeners.filter(a => a.event === event)
    for (const listener of matchingEvents) {
      listener.callback(json)
    }
  }
}

