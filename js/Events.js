'use strict'
/**
 * @abstract
 * @method addListener
 * @method handleEvent
 */
class Events {
  static #eventListeners = []

  /**
   * Add callback function to execute on given event
   * @param event dedicated server callback event
   * @param callback function to execute on event
   */
  static addListener (event, callback) {
    this.#eventListeners.push({ event, callback })
  }

  /**
   * Execute the event callbacks
   * @param event callback event name
   * @param json callback params
   */
  static handleEvent (event, json) {
    const matchingEvents = this.#eventListeners.filter(a => a.event === event)
    for (const listener of matchingEvents) {
      listener.callback(json)
    }
  }
}

export default Events
