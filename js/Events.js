'use strict'
import Logger from './Logger.js'
import client from './Client.js'
import Chat from './Chat.js'

class Events {
  #eventListeners = []

  /**
   * Execute the callback on event
   * @param event dedicated server callback event
   * @param callback function to execute on event
   */
  addListener (event, callback) {
    this.#eventListeners.push({ event, callback })
  }

  handleEvent (name, json) {
    const matchingEvents = this.#eventListeners.filter(a => a.event === name)
    for (const listener of matchingEvents) {
      listener.callback(json)
    }
  }
}

export default new Events()
