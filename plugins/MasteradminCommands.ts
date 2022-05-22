'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['ssn', 'setservername'],
    help: 'Change the server name.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the server name to ${info.text}$z$s${TM.colours.folly}.`
          }]
        },
        {
          method: 'SetServerName',
          params: [{ string: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sc', 'setcomment'],
    help: 'Change the server comment.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the server comment to ${info.text}$z$s${TM.colours.folly}.`
          }]
        },
        {
          method: 'SetServerComment',
          params: [{ string: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['smp', 'setmaxplayers'],
    help: 'Change the max players amount.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the max players amount to ${TM.colours.white + info.text}${TM.colours.folly}.`
          }],
        },
        {
          method: 'SetMaxPlayers',
          params: [{ int: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sms', 'setmaxspecs'],
    help: 'Change the max spectators amount.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the max spectators amount to ${TM.colours.white + info.text}${TM.colours.folly}.`
          }],
        },
        {
          method: 'SetMaxSpectators',
          params: [{ int: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sct', 'setchattime'],
    help: 'Change the time you spend on the podium screen.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the podium time to ${TM.colours.white + info.text}${TM.colours.folly}msec.`
          }],
        },
        {
          method: 'SetChatTime',
          params: [{ int: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['stl', 'settimelimit'],
    help: 'Change the time you spend gaming.',
    callback: async (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the time limit to ${TM.colours.white + info.text}${TM.colours.folly}msec.`
          }],
        },
        {
          method: 'SetTimeAttackLimit',
          params: [{ int: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sn', 'sendnotice'],
    help: 'Send a notice.',
    callback: async (info: MessageInfo) => {
      const time = info.text.split(' ')[0]
      const notice = info.text.split(' ').splice(1, info.text.length - 1).join(' ')
      if (!Number.isInteger(Number(time))) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the notice to ${TM.colours.white + TM.stripModifiers(notice, true)}${TM.colours.folly}.`
          }],
        },
        {
          method: 'SendNotice',
          params: [{ string: notice }, { string: '' }, { int: time }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the server.',
    callback: async (info: MessageInfo) => {
      // Might need a timeout for this one
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has killed the server :,(`
          }]
        },
        {
          method: 'StopServer'
        })
    },
    privilege: 3
  },
]

for (const command of commands) { TM.addCommand(command) }
