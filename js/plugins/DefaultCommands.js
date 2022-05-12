'use strict'
import Command from '../Command.js'
import Logger from '../Logger.js'
import Events from '../Events.js'
import Client from '../Client.js'
import colours from '../data/Colours.js'

class DefaultCommands {
  #commands = [
    // THIS IS JUST A TEST PLEASE FIX THIS FOR PRODUCTION
    new Command(
      ['qwe', 'qwer', '123', 'test'],
      'qqweqwe',
      () => { Client.call('ChatSendServerMessage', [{ string: `${colours.yellow}qwrqwerwe` }], false) }
    ),
    new Command(
      ['ct', 'colourtest'],
      'test the colours',
      () => {
        const col = Object.values(colours)
        Client.call('ChatSendServerMessage', [{ string: col.map((v) => `${v}|`).join(' ') }], false)
      }
    )
  ]

  initialize () {
    for (const command of this.#commands) {
      Events.addListener('TrackMania.PlayerChat', async (params) => {
        if (params[0] === 0 || !command.aliases.some(a => (params[2].trim().toLowerCase()).split(' ')[0] === `/${a}`)) { return }
        // TODO check for privileges db query
        command.callback(/* TODO::: PASS PLAYER INFO THIS IS CRITICAL FOR OUR MISSION */(params[2].trim()).split(/ /).shift())
      })
    }
  }
}

export default DefaultCommands
