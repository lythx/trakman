import { ErrorHandler } from '../src/ErrorHandler.js'
import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['ssn', 'setservername'],
    help: 'Change the server name.',
    callback: (info: MessageInfo) => {
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No name specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the server name to ${TM.palette.highlight + info.text}$z$s${TM.palette.admin}.`
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
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No comment specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the server comment to ${TM.palette.highlight + info.text}$z$s${TM.palette.admin}.`
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
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (!regex.test(info.text) || info.text.length < 1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the player password to ${TM.palette.highlight + (info.text.length > 0 ? info.text : 'none (disabled)')}$z$s${TM.palette.admin}.`
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
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (!regex.test(info.text) || info.text.length < 1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the spectator password to ${TM.palette.highlight + (info.text.length > 0 ? info.text : 'none (disabled)')}$z$s${TM.palette.admin}.`
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
      if (!Number.isInteger(Number(info.text))) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No number specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the max players amount to ${TM.palette.highlight + info.text}${TM.palette.admin}.`
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
      if (!Number.isInteger(Number(info.text))) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No number specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the max spectators amount to ${TM.palette.highlight + info.text}${TM.palette.admin}.`
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
      if (!Number.isInteger(Number(info.text))) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No number specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the podium time to ${TM.palette.highlight + info.text}${TM.palette.admin}msec.`
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
      if (!Number.isInteger(Number(info.text))) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No number specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the time limit to ${TM.palette.highlight + info.text}${TM.palette.admin}msec.`
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
      if (!Number.isInteger(Number(time))) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No time specified.`, info.login)
        return
      }
      if (notice === undefined || notice.length === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No notice specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the notice to ${TM.palette.highlight + TM.strip(notice, true)}${TM.palette.admin}.`
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
      let status: boolean
      if (['true', 'yes', 'y'].includes(info.text.toLowerCase())) { status = true }
      else if (['false', 'no', 'n'].includes(info.text.toLowerCase())) { status = false }
      else {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Not a valid boolean parameter.`, info.login)
        return
      }
      TM.multiCall({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (status ? 'allowed' : 'disallowed')}${TM.palette.admin} the challenge download.`
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
      let status: boolean
      if (['true', 'yes', 'y'].includes(info.text.toLowerCase())) { status = true }
      else if (['false', 'no', 'n'].includes(info.text.toLowerCase())) { status = false }
      else {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Not a valid boolean parameter.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (status ? 'allowed' : 'disallowed')}${TM.palette.admin} checkpoint respawning.`
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
      if (!Number.isInteger(Number(info.text))) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No number specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (Number(info.text) !== 0) ? 'enabled' : 'disabled'}${TM.palette.admin} forced opponent display.`
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
    aliases: ['ccs', 'coppers', 'checkcoppers'],
    help: 'Check the amount of coppers the server owns.',
    callback: async (info: MessageInfo) => {
      // TODO: Return immediately if the server isn't united. How to check tho..?
      const coppers = TM.call('GetServerCoppers')
      if (coppers instanceof Error) {
        ErrorHandler.error(`Couldn't retrieve the coppers amount.`, coppers.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Couldn't retrieve the coppers amount.`, info.login)
        return
      }
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.admin}Current server coppers amount${TM.palette.highlight}: ${coppers}${TM.palette.admin}.`, info.login)
    },
    privilege: 3
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the server.',
    callback: (info: MessageInfo) => {
      // Might need a timeout for this one // helloo im php // my name is kotlin boilerplate oop giga mega
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has killed the server :,(`
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
