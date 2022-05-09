'use strict'
import Logger from './Logger.js'
import client from './Client.js'

class Events {
  handleEvent (name, json) {
    Logger.warn(name)
    Logger.debug(json)
    switch (name) {
      case 'TrackMania.PlayerConnect':
        Events.#playerConnect(json)
    }
  }

  static #playerConnect (params) {
    Logger.fatal(params)
    Logger.debug(JSON.stringify(client))
    client.call('ChatSendServerMessage',
      [{ string: `SUSSY PETYA ${params[0]}` }])
  }
}

const events = new Events()

export default events
