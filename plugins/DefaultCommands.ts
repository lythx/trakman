'use strict'
import { Client } from '../src/Client.js'
import colours from '../src/data/Colours.json' assert {type: 'json'}
import { ChatService } from '../src/services/ChatService.js'

const commands: Command[] = [
  // THIS IS JUST A TEST PLEASE FIX THIS FOR PRODUCTION
  {
    aliases: ['qwe', 'qwer', '123', 'test'],
    help: 'qqweqwe',
    callback: async () => {
      await Client.call('ChatSendServerMessage', [{ string: `${colours.yellow}qwrqwerwe` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['ct', 'colourtest'],
    help: 'test the colours',
    callback: async () => {
      const col = Object.values(colours)
      await Client.call('ChatSendServerMessage', [{ string: col.map((v) => `${v}|`).join(' ') }], false)
    },
    privilege: 0
  },
  {
    aliases: ['test'],
    help: 'test',
    callback: async (params: any[]) => {
      await Client.call('ChatSendServerMessage', [{ string: JSON.stringify(params) }], false)
    },
    privilege: 0
  },
  {
    aliases: ['skip'],
    help: 'skip to next tracker rutracker.orgy',
    callback: async () => {
      await Client.call('NextChallenge')
    },
    privilege: 0
  }
]

for (const command of commands)
  ChatService.addCommand(command)
