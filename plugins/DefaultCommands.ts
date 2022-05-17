'use strict'
import { Client } from '../src/Client.js'
import colours from '../src/data/Colours.json' assert {type: 'json'}
import { ChatService } from '../src/services/ChatService.js'

const commands: Command[] = [
  // TODO: help consistency, tidy up
  // Testing commands, remove those later into development
  {
    aliases: ['ct', 'colourtest'],
    help: 'Display all the colours in order [TO BE REMOVED].',
    callback: async () => {
      const col = Object.values(colours)
      await Client.call('ChatSendServerMessage', [{ string: col.map((v) => `${v}>`).join(' ') }], false)
    },
    privilege: 0
  },
  // Basic commands, such as hi, bye, etc
  {
    aliases: ['hi', 'hey', 'hello'],
    help: 'Greet a certain someone.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Hey, ${info.text || 'everyone'}!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['bb', 'bye'],
    help: 'Bid your farewell.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Goodbye, ${info.text || 'everyone'}!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'], // Can add like every single one of them idk
    help: 'Express your gratitude.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Thanks, ${info.text || 'everyone'}!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Good game, ${info.text || 'everyone'}!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['bgm'],
    help: 'Let others know you didn\'t do your best.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Bad game for me! :,(` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['brb'],
    help: 'Notify people of your potential absence.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Be right back!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['afk', 'imstupid'],
    help: 'Update the server players on your position relative to the keyboard.',
    callback: async (info: MessageInfo) => {
      await Client.call('ForceSpectator', [{ string: `${info.login}` }, { number: 0 }], false)
      // await Client.call('SpectatorReleasePlayerSlot', [{string: `${info.login}`}], false) // Maybe multicall this?
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Away from keyboard!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['me', 'mfw'],
    help: 'Express the deep emotions hidden within your sinful soul.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$i${info.nickName}$z$s$i${colours.amber} ${info.text}` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['lol'],
    help: 'Indicate your amusement.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] LoL!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['lool'],
    help: 'Indicate your excess amusement.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] LoOoOoOoL!` }], false)
    },
    privilege: 0
  },
  {
    aliases: ['loool'],
    help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!` }], false)
    },
    privilege: 0
  },
  // Admin commands, not sure if the permissions really DO work so you can change the last param at will
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: async (info: MessageInfo) => {
      await Client.call('NextChallenge')
      await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] LoOoOoOoL!` }], false)
    },
    privilege: 1
  },
]

for (const command of commands)
  ChatService.addCommand(command)
