'use strict'
import colours from '../src/data/Colours.json' assert {type: 'json'}
import { ChatService } from '../src/services/ChatService.js'
import { TRAKMAN as TM } from '../src/Trakman.js'
import fs from 'node:fs/promises'
import { ErrorHandler } from '../src/ErrorHandler.js'

const commands: TMCommand[] = [
  // TODO: help consistency, tidy up
  // Testing commands, remove those later into development
  {
    aliases: ['ct', 'colourtest'],
    help: 'Display all the colours in order [TO BE REMOVED].',
    callback: async () => {
      const col = Object.values(colours)
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
      await TM.multiCall(false, { method: 'ForceSpectator', params: [{ string: info.login }, { int: 1 }] }, { method: 'ForceSpectator', params: [{ string: info.login }, { int: 0 }] }, { method: 'ChatSendServerMessage', params: [{ string: `$g[${info.nickName}$z$s$g] Away from keyboard!` }] })
      await new Promise(((r) => setTimeout(r, 100))) // Need a timeout for server to register that player is a spectator
      TM.call('SpectatorReleasePlayerSlot', [{ string: info.login }])
    },
    privilege: 0
  },
  {
    aliases: ['me', 'mfw'],
    help: 'Express the deep emotions hidden within your sinful soul.',
    callback: async (info: MessageInfo) => {
      await TM.sendMessage(`$i${info.nickName}$z$s$i${colours.amber} ${info.text}`)
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
      await TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`)
    },
    privilege: 0
  },
  // Admin commands, not sure if the permissions really DO work so you can change the last param at will
  // Masteradmin level
  {
    aliases: ['ssn', 'setservername'],
    help: 'Change the server name.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has changed the server name to ${info.text}$z$s.` }] }, { method: 'SetServerName', params: [{ string: info.text }] })
    },
    privilege: 3
  },
  {
    aliases: ['sc', 'setcomment'],
    help: 'Change the server comment.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has changed the server comment to ${info.text}$z$s.` }] }, { method: 'SetServerComment', params: [{ string: info.text }] })
    },
    privilege: 3
  },
  {
    aliases: ['smp', 'setmaxplayers'],
    help: 'Change the max players amount.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has changed the max players amount to ${info.text}.` }], }, { method: 'SetMaxPlayers', params: [{ int: info.text }] })
    },
    privilege: 3
  },
  {
    aliases: ['sms', 'setmaxspecs'],
    help: 'Change the max spectators amount.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has changed the max specs amount to ${info.text}.` }], }, { method: 'SetMaxSpectators', params: [{ int: info.text }] })
    },
    privilege: 3
  },
  {
    aliases: ['sct', 'setchattime'],
    help: 'Change the time you spend on the podium screen.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has set the podium time to ${info.text}ms.` }], }, { method: 'SetChatTime', params: [{ int: info.text }] })

    },
    privilege: 3
  },
  {
    aliases: ['stl', 'settimelimit'],
    help: 'Change the time you spend gaming.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has set the gaming time to ${info.text}ms.` }], }, { method: 'SetTimeAttackLimit', params: [{ int: info.text }] })

    },
    privilege: 3
  },
  {
    aliases: ['sn', 'sendnotice'],
    help: 'Send a notice.',
    callback: async (info: MessageInfo) => {
      const param = info.text.split(' ')
      if (!Number.isInteger(Number(param[0]))) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has sent a notice: ${param[1]}$z$s, displayed for ${param[0]}s.` }], }, { method: 'SendNotice', params: [{ string: param[1] }, { string: '' }, { int: param[0] }] })
    },
    privilege: 3
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the server.',
    callback: async (info: MessageInfo) => {
      // Might need a timeout for this one
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has killed the server :,(.` }] }, { method: 'StopServer' })
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
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has changed the gamemode to ${info.text}.` }], }, { method: 'SetGameMode', params: [{ int: mode }] })
    },
    privilege: 2
  },
  // Operator level
  {
    aliases: ['al', 'addlocal'],
    help: 'Add a challenge from your pc.',
    callback: async (info: MessageInfo) => {
      const split = info.text.split(' ')
      const fileName = split.shift() + '.Challenge.Gbx'
      const path = split.join(' ')
      let file
      try{
        file = (await fs.readFile(path, "base64"))
      } catch(err: any) {
        ErrorHandler.error(`Error when reading file on addlocal`, err.message)
        TM.sendMessage(`File ${path} doesn't exist`)
        return
      }
      try{
        await TM.call('WriteFile', [{ string: fileName}, {base64: file}])
      } catch(err: any) {
        ErrorHandler.error(`Failed to write file`, err.toString())
        TM.sendMessage(`Failed to write file`)
        return
      }
      try{
        await TM.call('InsertChallenge', [{ string: fileName }])
      } catch(err: any) {
        ErrorHandler.error(`Failed to insert challenge to jukebox`, err.toString())
        TM.sendMessage(`Failed to insert challenge to jukebox`)
        return
      }
      let res
      try{
        res = await TM.call('GetNextChallengeInfo')
      } catch(err: any) {
        ErrorHandler.error(`Failed to get next challenge info`, err.toString())
        TM.sendMessage(`Failed to get next challenge info`)
        return
      }
      const name = res?.[0]?.Name
      TM.sendMessage(`Player ${info.nickName} added and jukeboxed map ${name}`)
    },
    privilege: 1
  },
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has skipped the ongoing track.` }] }, { method: 'NextChallenge' })
    },
    privilege: 1
  },
  {
    aliases: ['r', 'res'],
    help: 'Restart the current map.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has restarted the ongoing track.` }] }, { method: 'RestartChallenge' })
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    callback: async (info: MessageInfo) => {
      if (TM.getPlayer(info.text) === undefined) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has kicked ${info.text}.` }] }, { method: 'Kick', params: [{ string: `${info.text}` }, { string: 'asdsasdasd' }] })
    },
    privilege: 1
  },
  {
    aliases: ['m', 'mute'],
    help: 'Mute a specific player.',
    callback: async (info: MessageInfo) => {
      if (TM.getPlayer(info.text) === undefined) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has muted ${info.text}.` }] }, { method: 'Ignore', params: [{ string: `${info.text}` }] })
    },
    privilege: 1
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    callback: async (info: MessageInfo) => {
      if (TM.getPlayer(info.text) === undefined) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has unmuted ${info.text}.` }] }, { method: 'UnIgnore', params: [{ string: `${info.text}` }] })
    },
    privilege: 1
  }
]

for (const command of commands) { ChatService.addCommand(command) }
