'use strict'
import Command from '../Command.js'
import Logger from '../Logger.js'
import Events from '../Events.js'
import Client from '../Client.js'

class DefaultCommands {
  #commands = [
    new Command(
      ['qwe', 'qwer', '123'],
      'qqweqwe',
      () => { Client.call('ChatSendServerMessage', [{ string: '$f0fqwrqwerwe' }], false) }
    )
  ]

  initialize () {
    for (const command of this.#commands) {
      Events.addListener('TrackMania.PlayerChat', async (params) => {
        if (params[0] === 0 || !command.aliases.some(a => (params[2].trim()).split(' ')[0] === `/${a}`)) { return }
        // TODO check for privileges db query
        command.callback((params[2].trim()).split(/ /).shift())
      })
    }
  }
}

export default DefaultCommands
