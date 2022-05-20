'use strict'
import { Client } from '../src/Client.js'
import colours from '../src/data/Colours.json' assert {type: 'json'}
import { ChatService } from '../src/services/ChatService.js'
import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
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
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] Hey, ${info.text || 'everyone'}!`)
      // await Client.call('ChatSendServerMessage', [{ string: `$g[${info.nickName}$z$s$g] Hey, ${info.text || 'everyone'}!` }], false)
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
      const c1: TMCall = { method: 'ForceSpectator', params: [{ string: info.login }, { int: 1 }] } //force spec
      const c2: TMCall = { method: 'ForceSpectator', params: [{ string: info.login }, { int: 0 }] } //allow player to change back from spec
      const c3: TMCall = { method: 'ChatSendServerMessage', params: [{ string: `$g[${info.nickName}$z$s$g] Away from keyboard!` }] }
      await TM.multiCall(false, c1, c2, c3)
      await new Promise(((r) => setTimeout(r, 1000))) //need a timeout for server to register that player is a spectator
      TM.call('SpectatorReleasePlayerSlot', [{ string: info.login }])
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
  // Masteradmin level
  {
    aliases: ['ssn', 'setservername'],
    help: 'Change the server name.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has changed the server name to ${info.text}$z$s.` }], false)
      await Client.call('SetServerName', [{ string: info.text }])
    },
    privilege: 3
  },
  {
    aliases: ['sc', 'setcomment'],
    help: 'Change the server comment.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has changed the server comment to ${info.text}$z$s.` }], false)
      await Client.call('SetServerComment', [{ string: info.text }])
    },
    privilege: 3
  },
  {
    aliases: ['smp', 'setmaxplayers'],
    help: 'Change the max players amount.',
    callback: async (info: MessageInfo) => {
      if (isNaN(Number(info.text))) { return }
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has changed the max players amount to ${info.text}.` }], false)
      await Client.call('SetMaxPlayers', [{ number: info.text }])
    },
    privilege: 3
  },
  {
    aliases: ['sms', 'setmaxspecs'],
    help: 'Change the max spectators amount.',
    callback: async (info: MessageInfo) => {
      if (isNaN(Number(info.text))) { return }
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has changed the max specs amount to ${info.text}.` }], false)
      await Client.call('SetMaxSpectators', [{ number: info.text }])
    },
    privilege: 3
  },
  {
    aliases: ['sct', 'setchattime'],
    help: 'Change the time you spend on the podium screen.',
    callback: async (info: MessageInfo) => {
      if (isNaN(Number(info.text))) { return }
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has set the podium time to ${info.text}ms.` }], false)
      await Client.call('SetChatTime', [{ number: info.text }])
    },
    privilege: 3
  },
  {
    aliases: ['sn', 'sendnotice'],
    help: 'Send a notice.',
    callback: async (info: MessageInfo) => {
      const param = info.text.split(' ')
      if (isNaN(Number(param[0]))) { return }
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has sent a notice: ${param[1]}$z$s, displayed for ${param[0]}s.` }], false)
      await Client.call('SendNotice', [{ string: param[1] }, { string: '' }, { number: param[0] }])
    },
    privilege: 3
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the server.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has killed the server :,(.` }], false)
      await Client.call('StopServer')
    },
    privilege: 3
  },
  // Admin level
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
    callback: async (info: MessageInfo) => {
      let mode: number
      switch (info.text.toLowerCase()) {
        case 'rounds':
        case 'round':
          mode = 0
          break
        case 'timeattack':
        case 'ta':
          mode = 1
          break
        case 'teams':
        case 'team':
          mode = 2
          break
        case 'laps':
        case 'lap':
          mode = 3
          break
        case 'stunts':
        case 'stunt':
          mode = 4
          break
        case 'cup':
          mode = 5
          break
        default:
          return
      }
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has changed the gamemode to ${info.text}.` }], false)
      await Client.call('SetGameMode', [{ number: mode }])
    },
    privilege: 2
  },
  // Operator level
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has skipped the ongoing track.` }], false)
      await Client.call('NextChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['r', 'res'],
    help: 'Restart the current map.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has restarted the ongoing track.` }], false)
      await Client.call('RestartChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has kicked ${info.text}.` }], false)
      await Client.call('Kick', [{ string: `${info.text}` }, { string: 'asdsasdasd' }])
    },
    privilege: 1
  },
  {
    aliases: ['m', 'mute'],
    help: 'Mute a specific player.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has muted ${info.text}.` }], false)
      await Client.call('Ignore', [{ string: `${info.text}` }])
    },
    privilege: 1
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Mute a specific player.',
    callback: async (info: MessageInfo) => {
      await Client.call('ChatSendServerMessage', [{ string: `${info.nickName}$z$s${colours.yellow} has unmuted ${info.text}.` }], false)
      await Client.call('UnIgnore', [{ string: `${info.text}` }])
    },
    privilege: 1
  }
]

for (const command of commands) { ChatService.addCommand(command) }
