'use strict'
import { ChatService } from '../src/services/ChatService.js'
import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  // TODO: help consistency, tidy up
  // Testing commands, remove those later into development
  {
    aliases: ['ct', 'colourtest'],
    help: 'Display all the colours in order [TO BE REMOVED].',
    callback: async () => {
      const col = Object.values(TM.colours)
      await TM.sendMessage(col.map((v) => `${v}>`).join(' '))
    },
    privilege: 0
  },
  // Basic commands, such as hi, bye, etc
  {
    aliases: ['hi', 'hey', 'hello'],
    help: 'Greet a certain someone.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Hey, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bb', 'bye'],
    help: 'Bid your farewell.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Goodbye, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'], // Can add like every single one of them idk
    help: 'Express your gratitude.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Thanks, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Good game, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bgm'],
    help: 'Let others know you didn\'t do your best.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Bad game for me! :,(`)
    },
    privilege: 0
  },
  {
    aliases: ['brb'],
    help: 'Notify people of your potential absence.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Be right back!`)
    },
    privilege: 0
  },
  {
    aliases: ['afk', 'imstupid'],
    help: 'Update the server players on your position relative to the keyboard.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false,
        {
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 1 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 0 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `$g[${info.nickName}$z$s$g] Away from keyboard!`
          }]
        })
      await new Promise((r) => setTimeout(r, 5)) // Need a timeout for server to register that player is a spectator
      TM.call('SpectatorReleasePlayerSlot', [{ string: info.login }])
    },
    privilege: 0
  },
  {
    aliases: ['me', 'mfw'],
    help: 'Express the deep emotions hidden within your sinful soul.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$i${info.nickName}$z$s$i${TM.colours.amber} ${info.text}`)
    },
    privilege: 0
  },
  {
    aliases: ['lol'],
    help: 'Indicate your amusement.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] LoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['lool'],
    help: 'Indicate your excess amusement.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['loool'],
    help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`)
    },
    privilege: 0
  }
]

for (const command of commands) { ChatService.addCommand(command) }
