'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['ssn', 'setservername'],
    help: 'Change the server name.',
    callback: (info: MessageInfo) => {
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the server name to ${TM.colours.white + info.text}$z$s${TM.colours.folly}.`
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
    callback: (info: MessageInfo) => {
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the server comment to ${TM.colours.white + info.text}$z$s${TM.colours.folly}.`
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
    aliases: ['sp', 'setpwd', 'setpassword'],
    help: 'Change the player password.',
    callback: (info: MessageInfo) => {
      // Passwords outside of ASCII range cannot be entered in the field
      const regex: RegExp = /[\p{ASCII}]+/u
      if (!regex.test(info.text)) { return }
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the player password to ${TM.colours.white + info.text}$z$s${TM.colours.folly}.`
          }]
        },
        {
          method: 'SetServerPassword',
          params: [{ string: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['ssp', 'setspecpwd', 'setspecpassword'],
    help: 'Change the spectator password.',
    callback: (info: MessageInfo) => {
      // Passwords outside of ASCII range cannot be entered in the field
      const regex: RegExp = /[\p{ASCII}]+/u
      if (!regex.test(info.text)) { return }
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the spectator password to ${TM.colours.white + info.text}$z$s${TM.colours.folly}.`
          }]
        },
        {
          method: 'SetServerPasswordForSpectator',
          params: [{ string: info.text }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['smp', 'setmaxplayers'],
    help: 'Change the max players amount.',
    callback: (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
        TM.multiCallNoRes({
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
    callback: (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      TM.multiCallNoRes({
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
    callback: (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      TM.multiCallNoRes({
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
    callback: (info: MessageInfo) => {
      if (!Number.isInteger(Number(info.text))) { return }
      TM.multiCallNoRes({
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
    callback: (info: MessageInfo) => {
      const time = info.text.split(' ')[0]
      const notice = info.text.split(' ').splice(1, info.text.length - 1).join(' ')
      if (!Number.isInteger(Number(time))) { return }
      TM.multiCallNoRes({
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
    aliases: ['acdl', 'allowchallengedownload'],
    help: 'Change whether challenge download is enabled.',
    callback: (info: MessageInfo) => {
      const status: boolean = (info.text.toLowerCase() === 'true') // Implement a better check maybe? lol
      TM.multiCall({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has `
              + `${TM.colours.white + status ? 'allowed' : 'disallowed'}${TM.colours.folly} the challenge download.`
          }]
        },
        {
          method: 'AllowChallengeDownload',
          params: [{
            boolean: status
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['drp', 'disablerespawn'],
    help: 'Change whether checkpoint respawning is enabled.',
    callback: (info: MessageInfo) => {
      const status: boolean = (info.text.toLowerCase() === 'true') // Implement a better check maybe? lol
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has `
              + `${TM.colours.white + status ? 'allowed' : 'disallowed'}${TM.colours.folly} checkpoint respawning.`
          }]
        },
        {
          method: 'SetDisableRespawn',
          params: [{
            boolean: status
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['fso', 'forceshowopp', 'forceshowopponents'],
    help: 'Change whether challenge download is enabled.',
    callback: (info: MessageInfo) => {
      // 0 = No change, 1 = Show all, n = Show n
      if (!Number.isInteger(Number(info.text))) { return }
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has `
              + `${TM.colours.white + (Number(info.text) !== 0) ? 'enabled' : 'disabled'}${TM.colours.folly} forced opponent display.`
          }]
        },
        {
          method: 'SetForceShowAllOpponents',
          params: [{
            int: info.text
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the server.',
    callback: (info: MessageInfo) => {
      // Might need a timeout for this one
      TM.multiCallNoRes({
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
  }
]

for (const command of commands) { TM.addCommand(command) }
