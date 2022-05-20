'use strict'
import colours from '../src/data/Colours.json' assert {type: 'json'}
import { TRAKMAN as TM } from '../src/Trakman.js'
import { ChatService } from '../src/services/ChatService.js'

const commands: TMCommand[] = [
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
]

for (const command of commands) { ChatService.addCommand(command) }