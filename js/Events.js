'use strict'
import Logger from './Logger.js'
import client from './Client.js'
import Chat from './Chat.js'

class Events {
  handleEvent (name, json) {
    Logger.warn(name)
    Logger.debug(json)
    switch (name) {
      case 'TrackMania.PlayerConnect':
        Events.#playerConnect(json)
        break
      case 'TrackMania.PlayerChat':
        this.#playerChat(json)
        break
    }
  }

  static #playerConnect (params) {
    Logger.fatal(params)
    Logger.debug(JSON.stringify(client))
    Chat.sendMessage(`SUSSY PETYA ${params[0]}`)
  }

  #playerChat(params) {
    //TODO
  }
}

export default new Events()
