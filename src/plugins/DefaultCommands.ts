'use strict'
import { Events } from '../Events.js'
import { Client } from '../Client.js'
import colours from '../data/Colours.json' assert {type: 'json'}

export class DefaultCommands {
  #commands: Command[] = [
    // THIS IS JUST A TEST PLEASE FIX THIS FOR PRODUCTION
    {
      aliases: ['qwe', 'qwer', '123', 'test'],
      help: 'qqweqwe',
      callback: async () => {
        await Client.call('ChatSendServerMessage', [{ string: `${colours.yellow}qwrqwerwe` }], false)
      },
      level: 0
    },
    {
      aliases: ['ct', 'colourtest'],
      help: 'test the colours',
      callback: async () => {
        const col = Object.values(colours)
        await Client.call('ChatSendServerMessage', [{ string: col.map((v) => `${v}|`).join(' ') }], false)
      },
      level: 0
    }
  ]

  initialize (): void {
    for (const command of this.#commands) {
      Events.addListener('TrackMania.PlayerChat', async (params: any[]) => {
        if (params[0] === 0 || !command.aliases.some((a: any) => (params[2].trim().toLowerCase()).split(' ')[0] === `/${a}`)) { return }
        // TODO check for privileges db query
        command.callback(/* TODO::: PASS PLAYER INFO THIS IS CRITICAL FOR OUR MISSION */(params[2].trim()).split(/ /).shift())
      })
    }
  }
}
